import { render } from '@testing-library/react-native';
import { DraggableBox } from '../floatingBubble/DraggableBox';

describe('DraggableBox', () => {
  it('should render without crashing', () => {
    const component = render(<DraggableBox />);
    expect(component).toBeDefined();
  });

  it('should render the draggable box component', () => {
    const { toJSON } = render(<DraggableBox />);
    const json = toJSON();
    
    // Component should render something
    expect(json).not.toBeNull();
    expect(json).toBeDefined();
  });

  it('should have a View component in the tree', () => {
    const { toJSON } = render(<DraggableBox />);
    const json = toJSON();
    
    // Check that the component renders a View (Animated.View renders as View in tests)
    expect(json?.type).toBe('View');
  });

  it('should have the correct style properties', () => {
    const { toJSON } = render(<DraggableBox />);
    const json = toJSON();
    
    // Check for expected style properties
    const style = json?.props?.style;
    expect(style).toBeDefined();
    
    // Style should be an object or array containing style objects
    if (Array.isArray(style)) {
      const flatStyle = Object.assign({}, ...style);
      expect(flatStyle.width).toBe(80);
      expect(flatStyle.height).toBe(80);
      expect(flatStyle.backgroundColor).toBe('tomato');
    } else {
      expect(style.width).toBe(80);
      expect(style.height).toBe(80);
      expect(style.backgroundColor).toBe('tomato');
    }
  });
});