import { render, fireEvent } from '@testing-library/react-native';
import { UserStatus } from '../floatingBubble/components/UserStatus';

describe('UserStatus', () => {
  it('should render without crashing', () => {
    const component = render(
      <UserStatus userRole="admin" isDragging={false} />
    );
    expect(component).toBeDefined();
  });

  describe('User Role Display', () => {
    it('should display Admin with correct color', () => {
      const { getByText, toJSON } = render(
        <UserStatus userRole="admin" isDragging={false} />
      );
      
      expect(getByText('Admin')).toBeTruthy();
      
      const json = toJSON();
      const dotView = json?.children?.[0];
      expect(dotView?.props?.style?.backgroundColor).toBe('#10B981');
    });

    it('should display Internal with correct color', () => {
      const { getByText, toJSON } = render(
        <UserStatus userRole="internal" isDragging={false} />
      );
      
      expect(getByText('Internal')).toBeTruthy();
      
      const json = toJSON();
      const dotView = json?.children?.[0];
      expect(dotView?.props?.style?.backgroundColor).toBe('#6366F1');
    });

    it('should display User with correct color', () => {
      const { getByText, toJSON } = render(
        <UserStatus userRole="user" isDragging={false} />
      );
      
      expect(getByText('User')).toBeTruthy();
      
      const json = toJSON();
      const dotView = json?.children?.[0];
      expect(dotView?.props?.style?.backgroundColor).toBe('#6B7280');
    });
  });

  describe('Interaction', () => {
    it('should call onPress when pressed and not dragging', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <UserStatus 
          userRole="admin" 
          isDragging={false} 
          onPress={onPressMock}
        />
      );
      
      fireEvent.press(getByText('Admin'));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when dragging', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <UserStatus 
          userRole="admin" 
          isDragging={true} 
          onPress={onPressMock}
        />
      );
      
      fireEvent.press(getByText('Admin'));
      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('should render as View when onPress is not provided', () => {
      const { toJSON } = render(
        <UserStatus userRole="admin" isDragging={false} />
      );
      
      const json = toJSON();
      expect(json?.type).toBe('View');
    });

    it('should render as TouchableOpacity when onPress is provided', () => {
      const onPressMock = jest.fn();
      const { toJSON } = render(
        <UserStatus 
          userRole="admin" 
          isDragging={false} 
          onPress={onPressMock}
        />
      );
      
      const json = toJSON();
      expect(json?.type).toBe('View'); // TouchableOpacity renders as View in tests
      expect(json?.props?.accessible).toBe(true);
      expect(json?.props?.accessibilityRole).toBe('button');
    });
  });

  describe('Styling', () => {
    it('should have correct container styles', () => {
      const { toJSON } = render(
        <UserStatus userRole="admin" isDragging={false} />
      );
      
      const json = toJSON();
      const containerStyle = json?.props?.style;
      
      expect(containerStyle).toMatchObject({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 8,
      });
    });

    it('should have correct dot styles', () => {
      const { toJSON } = render(
        <UserStatus userRole="admin" isDragging={false} />
      );
      
      const json = toJSON();
      const dotView = json?.children?.[0];
      
      expect(dotView?.props?.style).toMatchObject({
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
      });
    });

    it('should have correct text styles', () => {
      const { toJSON } = render(
        <UserStatus userRole="admin" isDragging={false} />
      );
      
      const json = toJSON();
      const textElement = json?.children?.[1];
      
      expect(textElement?.props?.style).toMatchObject({
        fontSize: 10,
        fontWeight: '500',
        letterSpacing: 0.3,
      });
    });
  });
});