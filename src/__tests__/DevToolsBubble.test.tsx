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
    
    // Component should render something
    expect(json).not.toBeNull();
    expect(json).toBeDefined();
  });

  it('should have a View component in the tree', () => {
    const { toJSON } = render(<DevToolsBubble />);
    const json = toJSON();
    
    // Check that the component renders a View
    expect(json?.type).toBe('View');
  });
});