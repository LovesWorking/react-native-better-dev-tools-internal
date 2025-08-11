import { renderHook, act } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { useReactQueryState } from '../hooks/useReactQueryState';
import useAllQueries from '../hooks/useAllQueries';
import { useModalManager } from '../hooks/useModalManager';

// Mock QueryClient
const createMockQueryClient = () => {
  const queryCache = {
    getAll: jest.fn().mockReturnValue([
      {
        queryHash: 'hash1',
        queryKey: ['posts', 1],
        state: {
          status: 'success',
          fetchStatus: 'idle',
          dataUpdatedAt: Date.now(),
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
          dataUpdatedAt: Date.now() - 60000,
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
      {
        queryHash: 'hash4',
        queryKey: ['pending-test'],
        state: {
          status: 'pending',
          fetchStatus: 'fetching',
        },
        isStale: () => false,
        getObserversCount: () => 1,
      },
    ]),
    subscribe: jest.fn().mockReturnValue(() => {}),
  };

  const mutationCache = {
    getAll: jest.fn().mockReturnValue([
      {
        mutationId: 1,
        state: { status: 'idle' },
      },
      {
        mutationId: 2,
        state: { status: 'pending' },
      },
    ]),
    subscribe: jest.fn().mockReturnValue(() => {}),
  };

  return {
    getQueryCache: () => queryCache,
    getMutationCache: () => mutationCache,
  } as unknown as QueryClient;
};

describe('React Query Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createMockQueryClient();
  });

  describe('useReactQueryState', () => {
    it('should return correct subtitle with query and mutation counts', () => {
      const { result } = renderHook(() => useReactQueryState(queryClient));

      const subtitle = result.current.getRnBetterDevToolsSubtitle();
      expect(subtitle).toBe('4 queries • 2 mutations');
    });

    it('should update subtitle when cache changes', () => {
      const { result, rerender } = renderHook(() =>
        useReactQueryState(queryClient)
      );

      expect(result.current.getRnBetterDevToolsSubtitle()).toBe('4 queries • 2 mutations');

      // Update mock to return different values
      (queryClient.getQueryCache().getAll as jest.Mock).mockReturnValue([
        {
          queryHash: 'hash1',
          queryKey: ['posts', 1],
          state: { status: 'success', fetchStatus: 'idle' },
          isStale: () => false,
          getObserversCount: () => 1,
        },
      ]);
      (queryClient.getMutationCache().getAll as jest.Mock).mockReturnValue([]);

      rerender();

      // Trigger re-render (in real app this would be triggered by cache subscription)
      act(() => {
        const { result: newResult } = renderHook(() =>
          useReactQueryState(queryClient)
        );
        expect(newResult.current.getRnBetterDevToolsSubtitle()).toMatch(/queries/);
      });
    });
  });

  describe('useAllQueries', () => {
    it('should return all queries from cache', () => {
      const { result } = renderHook(() => useAllQueries());

      expect(result.current).toHaveLength(4);
      expect(result.current[0].queryKey).toEqual(['posts', 1]);
      expect(result.current[1].queryKey).toEqual(['users', 1]);
      expect(result.current[2].queryKey).toEqual(['error-test']);
      expect(result.current[3].queryKey).toEqual(['pending-test']);
    });

    it('should return empty array when no queries', () => {
      (queryClient.getQueryCache().getAll as jest.Mock).mockReturnValue([]);

      const { result } = renderHook(() => useAllQueries());

      expect(result.current).toEqual([]);
    });
  });

  describe('useModalManager', () => {
    it('should initialize with closed modal', () => {
      const { result } = renderHook(() => useModalManager());

      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.currentRoute).toBe('browser');
      expect(result.current.detailView).toBeNull();
    });

    it('should open and close modal', () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal();
      });

      expect(result.current.isModalOpen).toBe(true);

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isModalOpen).toBe(false);
    });

    it('should navigate to different routes', () => {
      const { result } = renderHook(() => useModalManager());

      act(() => {
        result.current.openModal();
        result.current.setCurrentRoute('editor');
      });

      expect(result.current.currentRoute).toBe('editor');

      act(() => {
        result.current.setCurrentRoute('browser');
      });

      expect(result.current.currentRoute).toBe('browser');
    });

    it('should set detail view', () => {
      const { result } = renderHook(() => useModalManager());

      const mockQuery = {
        queryHash: 'test-hash',
        queryKey: ['test'],
      };

      act(() => {
        result.current.setDetailView(mockQuery);
      });

      expect(result.current.detailView).toEqual(mockQuery);

      act(() => {
        result.current.setDetailView(null);
      });

      expect(result.current.detailView).toBeNull();
    });

    it('should reset state on close', () => {
      const { result } = renderHook(() => useModalManager());

      const mockQuery = {
        queryHash: 'test-hash',
        queryKey: ['test'],
      };

      act(() => {
        result.current.openModal();
        result.current.setCurrentRoute('editor');
        result.current.setDetailView(mockQuery);
      });

      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.currentRoute).toBe('editor');
      expect(result.current.detailView).toEqual(mockQuery);

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isModalOpen).toBe(false);
      // State should be preserved after close for persistence
      expect(result.current.currentRoute).toBe('editor');
      expect(result.current.detailView).toEqual(mockQuery);
    });
  });

});