import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import reactQueryPlugin from '../index';
import { EventEmitter } from 'events';

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  ChevronRight: () => null,
  X: () => null,
}));

// Mock the hooks
jest.mock('../hooks/useReactQueryState', () => ({
  useReactQueryState: jest.fn().mockReturnValue({
    getRnBetterDevToolsSubtitle: () => '5 queries • 2 mutations',
  }),
}));

jest.mock('../hooks/useAllQueries', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue([
    {
      queryHash: 'hash1',
      queryKey: ['posts', 1],
      state: {
        status: 'success',
        fetchStatus: 'idle',
      },
      isStale: () => false,
      getObserversCount: () => 1,
    },
    {
      queryHash: 'hash2',
      queryKey: ['users', 1],
      state: {
        status: 'success',
        fetchStatus: 'idle',
      },
      isStale: () => true,
      getObserversCount: () => 2,
    },
    {
      queryHash: 'hash3',
      queryKey: ['error-test'],
      state: {
        status: 'error',
        fetchStatus: 'idle',
      },
      isStale: () => true,
      getObserversCount: () => 1,
    },
  ]),
}));

// Mock BaseFloatingModal
jest.mock('../_components/floating-bubble/modal/components/BaseFloatingModal', () => ({
  BaseFloatingModal: ({ children, header, footer, onClose }: any) => (
    <>{header}{children}{footer}</>
  ),
}));

describe('ReactQueryPlugin', () => {
  let queryClient: QueryClient;
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    eventEmitter = new EventEmitter();
  });

  afterEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  describe('Plugin Configuration', () => {
    it('should have correct plugin metadata', () => {
      expect(reactQueryPlugin.id).toBe('react-query');
      expect(reactQueryPlugin.name).toBe('React Query DevTools');
      expect(reactQueryPlugin.checkAvailability()).toBe(true);
    });

    it('should have correct default config', () => {
      expect(reactQueryPlugin.defaultConfig).toEqual({
        enabled: true,
        settings: {
          showInBubble: true,
          enableLogging: true,
          persistModalState: true,
          defaultOpenModal: false,
        },
      });
    });
  });

  describe('Bubble Component', () => {
    const BubbleComponent = reactQueryPlugin.component;

    it('should render bubble component with query client', () => {
      const context = {
        queryClient,
        events: eventEmitter,
      };

      const { getByLabelText, getByText } = render(
        <BubbleComponent context={context} isDragging={false} />
      );

      expect(getByLabelText('React Query DevTools')).toBeTruthy();
      expect(getByText('5q 2m')).toBeTruthy();
    });

    it('should not render bubble when no query client', () => {
      const context = {
        queryClient: null,
        events: eventEmitter,
      };

      const { queryByLabelText } = render(
        <BubbleComponent context={context} isDragging={false} />
      );

      expect(queryByLabelText('React Query DevTools')).toBeNull();
    });

    it('should emit open-modal event when pressed', () => {
      const context = {
        queryClient,
        events: eventEmitter,
      };
      const emitSpy = jest.spyOn(eventEmitter, 'emit');

      const { getByLabelText } = render(
        <BubbleComponent context={context} isDragging={false} />
      );

      fireEvent.press(getByLabelText('React Query DevTools'));
      expect(emitSpy).toHaveBeenCalledWith('react-query:open-modal');
    });

    it('should be disabled when dragging', () => {
      const context = {
        queryClient,
        events: eventEmitter,
      };
      const emitSpy = jest.spyOn(eventEmitter, 'emit');

      const { getByLabelText } = render(
        <BubbleComponent context={context} isDragging={true} />
      );

      fireEvent.press(getByLabelText('React Query DevTools'));
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should display only query count when no mutations', () => {
      const { useReactQueryState } = require('../hooks/useReactQueryState');
      useReactQueryState.mockReturnValue({
        getRnBetterDevToolsSubtitle: () => '3 queries • 0 mutations',
      });

      const context = {
        queryClient,
        events: eventEmitter,
      };

      const { getByText, queryByText } = render(
        <BubbleComponent context={context} isDragging={false} />
      );

      expect(getByText('3q')).toBeTruthy();
      expect(queryByText(/m/)).toBeNull();
    });
  });

  describe('Modal Component', () => {
    const ModalComponent = reactQueryPlugin.modalComponent!;

    it('should render modal with query list', () => {
      const context = {
        queryClient,
        events: eventEmitter,
      };
      const onClose = jest.fn();

      const { getByText } = render(
        <ModalComponent context={context} onClose={onClose} />
      );

      expect(getByText('React Query DevTools')).toBeTruthy();
      expect(getByText('3 queries')).toBeTruthy();
      expect(getByText('Queries')).toBeTruthy();
      expect(getByText('Mutations')).toBeTruthy();
    });

    it('should show error when no query client', () => {
      const context = {
        queryClient: null,
        events: eventEmitter,
      };
      const onClose = jest.fn();

      const { getByText } = render(
        <ModalComponent context={context} onClose={onClose} />
      );

      expect(getByText('No QueryClient available')).toBeTruthy();
      expect(getByText('Close')).toBeTruthy();
    });

    it('should display queries with correct status colors', () => {
      const context = {
        queryClient,
        events: eventEmitter,
      };
      const onClose = jest.fn();

      const { getByText, getAllByText } = render(
        <ModalComponent context={context} onClose={onClose} />
      );

      // Check for Fresh, Stale, and Error statuses
      expect(getAllByText('Fresh').length).toBeGreaterThan(0);
      expect(getByText('Stale')).toBeTruthy();
      expect(getByText('Error')).toBeTruthy();
    });

    it('should display query keys correctly', () => {
      const context = {
        queryClient,
        events: eventEmitter,
      };
      const onClose = jest.fn();

      const { getByText } = render(
        <ModalComponent context={context} onClose={onClose} />
      );

      expect(getByText('posts › 1')).toBeTruthy();
      expect(getByText('users › 1')).toBeTruthy();
      expect(getByText('error-test')).toBeTruthy();
    });

    it('should switch between queries and mutations tabs', () => {
      const context = {
        queryClient,
        events: eventEmitter,
      };
      const onClose = jest.fn();

      const { getByText } = render(
        <ModalComponent context={context} onClose={onClose} />
      );

      // Initially on Queries tab
      expect(getByText('posts › 1')).toBeTruthy();

      // Switch to Mutations tab
      fireEvent.press(getByText('Mutations'));
      expect(getByText('No mutations found')).toBeTruthy();
    });

    it('should call onClose when close button pressed', () => {
      const context = {
        queryClient,
        events: eventEmitter,
      };
      const onClose = jest.fn();

      const { getByText } = render(
        <ModalComponent context={context} onClose={onClose} />
      );

      fireEvent.press(getByText('Close'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should display observer counts', () => {
      const context = {
        queryClient,
        events: eventEmitter,
      };
      const onClose = jest.fn();

      const { getByText } = render(
        <ModalComponent context={context} onClose={onClose} />
      );

      expect(getByText('1 observer')).toBeTruthy();
      expect(getByText('2 observers')).toBeTruthy();
    });
  });

  describe('Plugin Lifecycle', () => {
    it('should mount plugin correctly', async () => {
      const context = {
        queryClient,
        events: eventEmitter,
      };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await reactQueryPlugin.onMount?.(context);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[React Query Plugin] Mounted - Comprehensive version!'
      );

      consoleSpy.mockRestore();
    });

    it('should handle mount without query client', async () => {
      const context = {
        queryClient: null,
        events: eventEmitter,
      };
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await reactQueryPlugin.onMount?.(context);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[React Query Plugin] No QueryClient provided'
      );

      consoleSpy.mockRestore();
    });

    it('should unmount plugin correctly', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await reactQueryPlugin.onUnmount?.();

      expect(consoleSpy).toHaveBeenCalledWith('[React Query Plugin] Unmounted');

      consoleSpy.mockRestore();
    });

    it('should register event handlers on mount', async () => {
      const context = {
        queryClient,
        events: eventEmitter,
      };
      const onSpy = jest.spyOn(eventEmitter, 'on');

      await reactQueryPlugin.onMount?.(context);

      expect(onSpy).toHaveBeenCalledWith(
        'react-query:open-route',
        expect.any(Function)
      );
    });

    it('should auto-open modal in dev mode after delay', async () => {
      const context = {
        queryClient,
        events: eventEmitter,
      };
      const emitSpy = jest.spyOn(eventEmitter, 'emit');

      jest.useFakeTimers();
      await reactQueryPlugin.onMount?.(context);
      jest.advanceTimersByTime(2000);

      expect(emitSpy).toHaveBeenCalledWith('react-query:open-modal');

      jest.useRealTimers();
    });
  });
});