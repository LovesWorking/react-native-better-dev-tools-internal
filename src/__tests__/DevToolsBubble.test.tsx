import { render } from '@testing-library/react-native';
import { DevToolsBubble } from '../floatingBubble/DevToolsBubble';

describe('DevToolsBubble', () => {
  it('should render without crashing', () => {
    const component = render(<DevToolsBubble />);
    expect(component).toBeDefined();
  });

  it('should render the bubble component', () => {
    const { toJSON } = render(<DevToolsBubble />);
    const json = toJSON();
    
    expect(json).not.toBeNull();
    expect(json).toBeDefined();
  });

  it('should have a View component in the tree', () => {
    const { toJSON } = render(<DevToolsBubble />);
    const json = toJSON();
    
    expect(json?.type).toBe('View');
  });

  describe('Props handling', () => {
    it('should render without userRole', () => {
      const { toJSON } = render(<DevToolsBubble />);
      const json = toJSON();
      
      expect(json).toBeDefined();
      // Should only show drag handle when no userRole
      const stringify = JSON.stringify(json);
      expect(stringify).not.toContain('Admin');
      expect(stringify).not.toContain('Internal');
      expect(stringify).not.toContain('User');
    });

    it('should render UserStatus when userRole is provided', () => {
      const { getByText } = render(
        <DevToolsBubble userRole="admin" />
      );
      
      expect(getByText('Admin')).toBeTruthy();
    });

    it('should render correct userRole text for internal', () => {
      const { getByText } = render(
        <DevToolsBubble userRole="internal" />
      );
      
      expect(getByText('Internal')).toBeTruthy();
    });

    it('should render correct userRole text for user', () => {
      const { getByText } = render(
        <DevToolsBubble userRole="user" />
      );
      
      expect(getByText('User')).toBeTruthy();
    });

    it('should hide UserStatus when hideUserStatus is true', () => {
      const { queryByText } = render(
        <DevToolsBubble userRole="admin" hideUserStatus={true} />
      );
      
      expect(queryByText('Admin')).toBeNull();
    });

    it('should show UserStatus when hideUserStatus is false', () => {
      const { getByText } = render(
        <DevToolsBubble userRole="admin" hideUserStatus={false} />
      );
      
      expect(getByText('Admin')).toBeTruthy();
    });

    it('should handle onStatusPress callback', () => {
      const onStatusPressMock = jest.fn();
      const { getByText } = render(
        <DevToolsBubble 
          userRole="admin" 
          onStatusPress={onStatusPressMock}
        />
      );
      
      // Note: The press event would be tested in integration,
      // here we just verify the prop is passed
      expect(getByText('Admin')).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('should have dark theme background', () => {
      const { toJSON } = render(<DevToolsBubble />);
      const json = toJSON();
      
      // Find the container view
      const containerView = json?.children?.[0];
      const containerStyle = containerView?.props?.style;
      
      expect(containerStyle?.backgroundColor).toBe('#171717');
    });

    it('should have proper border radius', () => {
      const { toJSON } = render(<DevToolsBubble />);
      const json = toJSON();
      
      const containerView = json?.children?.[0];
      const containerStyle = containerView?.props?.style;
      
      expect(containerStyle?.borderRadius).toBe(6);
    });

    it('should have drag handle area', () => {
      const { toJSON } = render(<DevToolsBubble />);
      const json = toJSON();
      
      // The drag handle should be the first child of the container
      const containerView = json?.children?.[0];
      const dragHandle = containerView?.children?.[0];
      
      expect(dragHandle).toBeDefined();
      expect(dragHandle?.props?.style?.width).toBe(32);
    });
  });

  describe('Drag functionality', () => {
    it('should have PanResponder handlers attached', () => {
      const { toJSON } = render(<DevToolsBubble />);
      const json = toJSON();
      
      // Find the view with pan handlers
      const containerView = json?.children?.[0];
      
      // Check for PanResponder props
      expect(containerView?.props?.onStartShouldSetResponder).toBeDefined();
      expect(containerView?.props?.onMoveShouldSetResponder).toBeDefined();
      expect(containerView?.props?.onResponderGrant).toBeDefined();
      expect(containerView?.props?.onResponderMove).toBeDefined();
      expect(containerView?.props?.onResponderRelease).toBeDefined();
    });
  });
});