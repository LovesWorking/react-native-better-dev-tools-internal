import { render } from '@testing-library/react-native';
import { Divider } from '../floatingBubble/components/Divider';

describe('Divider', () => {
  it('should render without crashing', () => {
    const component = render(<Divider />);
    expect(component).toBeDefined();
  });

  it('should render a View component', () => {
    const { toJSON } = render(<Divider />);
    const json = toJSON();
    
    expect(json?.type).toBe('View');
  });

  describe('Styling', () => {
    it('should have correct dimensions', () => {
      const { toJSON } = render(<Divider />);
      const json = toJSON();
      
      const dividerStyle = json?.props?.style;
      
      expect(dividerStyle?.width).toBe(1);
      expect(dividerStyle?.height).toBe(12);
    });

    it('should have correct background color', () => {
      const { toJSON } = render(<Divider />);
      const json = toJSON();
      
      const dividerStyle = json?.props?.style;
      
      expect(dividerStyle?.backgroundColor).toBe('rgba(107, 114, 128, 0.4)');
    });

    it('should have flexShrink set to 0', () => {
      const { toJSON } = render(<Divider />);
      const json = toJSON();
      
      const dividerStyle = json?.props?.style;
      
      expect(dividerStyle?.flexShrink).toBe(0);
    });
  });

  describe('Integration', () => {
    it('should be usable as a separator between components', () => {
      const { toJSON } = render(<Divider />);
      const json = toJSON();
      
      // Verify it's a simple view that can be placed between components
      expect(json?.children).toBeNull(); // No children
      expect(json?.type).toBe('View');
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { toJSON } = render(<Divider />);
      const json = toJSON();
      
      expect(json).toBeDefined();
      expect(json).not.toBeNull();
      
      // Verify the complete structure
      expect(json).toMatchObject({
        type: 'View',
        props: {
          style: {
            width: 1,
            height: 12,
            backgroundColor: 'rgba(107, 114, 128, 0.4)',
            flexShrink: 0,
          }
        }
      });
    });
  });
});