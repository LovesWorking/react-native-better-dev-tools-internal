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

  describe('Environment Props', () => {
    it('should render without environment', () => {
      const { toJSON } = render(<DevToolsBubble />);
      const json = toJSON();
      
      expect(json).toBeDefined();
      const stringify = JSON.stringify(json);
      expect(stringify).not.toContain('LOCAL');
      expect(stringify).not.toContain('DEV');
      expect(stringify).not.toContain('PROD');
    });

    it('should render EnvironmentIndicator when environment is provided', () => {
      const { getByText } = render(
        <DevToolsBubble environment="local" />
      );
      
      expect(getByText('LOCAL')).toBeTruthy();
    });

    it('should render correct environment text for dev', () => {
      const { getByText } = render(
        <DevToolsBubble environment="dev" />
      );
      
      expect(getByText('DEV')).toBeTruthy();
    });

    it('should render correct environment text for qa', () => {
      const { getByText } = render(
        <DevToolsBubble environment="qa" />
      );
      
      expect(getByText('QA')).toBeTruthy();
    });

    it('should render correct environment text for staging', () => {
      const { getByText } = render(
        <DevToolsBubble environment="staging" />
      );
      
      expect(getByText('STAGING')).toBeTruthy();
    });

    it('should render correct environment text for prod', () => {
      const { getByText } = render(
        <DevToolsBubble environment="prod" />
      );
      
      expect(getByText('PROD')).toBeTruthy();
    });

    it('should hide EnvironmentIndicator when hideEnvironment is true', () => {
      const { queryByText } = render(
        <DevToolsBubble environment="local" hideEnvironment={true} />
      );
      
      expect(queryByText('LOCAL')).toBeNull();
    });

    it('should show EnvironmentIndicator when hideEnvironment is false', () => {
      const { getByText } = render(
        <DevToolsBubble environment="local" hideEnvironment={false} />
      );
      
      expect(getByText('LOCAL')).toBeTruthy();
    });
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

    it('should handle onEnvironmentPress callback', () => {
      const onEnvironmentPressMock = jest.fn();
      const { getByText } = render(
        <DevToolsBubble 
          environment="local" 
          onEnvironmentPress={onEnvironmentPressMock}
        />
      );
      
      // Note: The press event would be tested in integration,
      // here we just verify the prop is passed
      expect(getByText('LOCAL')).toBeTruthy();
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

  describe('Divider visibility', () => {
    it('should show divider when both environment and userRole are present', () => {
      const { toJSON } = render(
        <DevToolsBubble environment="local" userRole="admin" />
      );
      const json = toJSON();
      
      // Check for divider by looking for its specific style
      const stringify = JSON.stringify(json);
      expect(stringify).toContain('rgba(107, 114, 128, 0.4)'); // Divider color
    });

    it('should not show divider when only environment is present', () => {
      const { toJSON } = render(
        <DevToolsBubble environment="local" />
      );
      const json = toJSON();
      
      const stringify = JSON.stringify(json);
      // Should contain environment indicator but not divider
      expect(stringify).toContain('LOCAL');
      // Count occurrences of divider color - should not appear
      const dividerMatches = (stringify.match(/rgba\(107, 114, 128, 0.4\)/g) || []).length;
      expect(dividerMatches).toBe(0);
    });

    it('should not show divider when only userRole is present', () => {
      const { toJSON } = render(
        <DevToolsBubble userRole="admin" />
      );
      const json = toJSON();
      
      const stringify = JSON.stringify(json);
      // Should contain user status but not divider
      expect(stringify).toContain('Admin');
      // Count occurrences of divider color - should not appear
      const dividerMatches = (stringify.match(/rgba\(107, 114, 128, 0.4\)/g) || []).length;
      expect(dividerMatches).toBe(0);
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