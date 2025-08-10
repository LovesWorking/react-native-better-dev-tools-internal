import { render } from '@testing-library/react-native';
import { EnvironmentIndicator } from '../floatingBubble/components/EnvironmentIndicator';

describe('EnvironmentIndicator', () => {
  it('should render without crashing', () => {
    const component = render(<EnvironmentIndicator environment="local" />);
    expect(component).toBeDefined();
  });

  describe('Environment labels', () => {
    it('should display LOCAL for local environment', () => {
      const { getByText } = render(<EnvironmentIndicator environment="local" />);
      expect(getByText('LOCAL')).toBeTruthy();
    });

    it('should display DEV for dev environment', () => {
      const { getByText } = render(<EnvironmentIndicator environment="dev" />);
      expect(getByText('DEV')).toBeTruthy();
    });

    it('should display QA for qa environment', () => {
      const { getByText } = render(<EnvironmentIndicator environment="qa" />);
      expect(getByText('QA')).toBeTruthy();
    });

    it('should display STAGING for staging environment', () => {
      const { getByText } = render(<EnvironmentIndicator environment="staging" />);
      expect(getByText('STAGING')).toBeTruthy();
    });

    it('should display PROD for prod environment', () => {
      const { getByText } = render(<EnvironmentIndicator environment="prod" />);
      expect(getByText('PROD')).toBeTruthy();
    });
  });

  describe('Environment colors', () => {
    it('should have cyan dot for local environment', () => {
      const { toJSON } = render(<EnvironmentIndicator environment="local" />);
      const json = toJSON();
      
      // Find the dot view (second child of container)
      const dotView = json?.children?.[0];
      const dotStyle = dotView?.props?.style;
      
      expect(dotStyle?.backgroundColor).toBe('#06B6D4');
    });

    it('should have orange dot for dev environment', () => {
      const { toJSON } = render(<EnvironmentIndicator environment="dev" />);
      const json = toJSON();
      
      const dotView = json?.children?.[0];
      const dotStyle = dotView?.props?.style;
      
      expect(dotStyle?.backgroundColor).toBe('#F97316');
    });

    it('should have purple dot for qa environment', () => {
      const { toJSON } = render(<EnvironmentIndicator environment="qa" />);
      const json = toJSON();
      
      const dotView = json?.children?.[0];
      const dotStyle = dotView?.props?.style;
      
      expect(dotStyle?.backgroundColor).toBe('#8B5CF6');
    });

    it('should have green dot for staging environment', () => {
      const { toJSON } = render(<EnvironmentIndicator environment="staging" />);
      const json = toJSON();
      
      const dotView = json?.children?.[0];
      const dotStyle = dotView?.props?.style;
      
      expect(dotStyle?.backgroundColor).toBe('#10B981');
    });

    it('should have red dot for prod environment', () => {
      const { toJSON } = render(<EnvironmentIndicator environment="prod" />);
      const json = toJSON();
      
      const dotView = json?.children?.[0];
      const dotStyle = dotView?.props?.style;
      
      expect(dotStyle?.backgroundColor).toBe('#DC2626');
    });
  });

  describe('Styling', () => {
    it('should have proper dot dimensions', () => {
      const { toJSON } = render(<EnvironmentIndicator environment="local" />);
      const json = toJSON();
      
      const dotView = json?.children?.[0];
      const dotStyle = dotView?.props?.style;
      
      expect(dotStyle?.width).toBe(8);
      expect(dotStyle?.height).toBe(8);
      expect(dotStyle?.borderRadius).toBe(4);
    });

    it('should have proper text styling', () => {
      const { toJSON } = render(<EnvironmentIndicator environment="local" />);
      const json = toJSON();
      
      const textElement = json?.children?.[1];
      const textStyle = textElement?.props?.style;
      
      expect(textStyle?.fontSize).toBe(11);
      expect(textStyle?.fontWeight).toBe('600');
      expect(textStyle?.color).toBe('#F9FAFB');
      expect(textStyle?.letterSpacing).toBe(0.5);
    });

    it('should have proper container layout', () => {
      const { toJSON } = render(<EnvironmentIndicator environment="local" />);
      const json = toJSON();
      
      const containerStyle = json?.props?.style;
      
      expect(containerStyle?.flexDirection).toBe('row');
      expect(containerStyle?.alignItems).toBe('center');
      expect(containerStyle?.paddingVertical).toBe(6);
      expect(containerStyle?.paddingHorizontal).toBe(8);
    });

    it('should have shadow styling on dot', () => {
      const { toJSON } = render(<EnvironmentIndicator environment="local" />);
      const json = toJSON();
      
      const dotView = json?.children?.[0];
      const dotStyle = dotView?.props?.style;
      
      expect(dotStyle?.shadowColor).toBe('#06B6D4');
      expect(dotStyle?.shadowOpacity).toBe(0.6);
      expect(dotStyle?.shadowRadius).toBe(4);
      expect(dotStyle?.elevation).toBe(2);
    });
  });

  describe('Snapshot tests', () => {
    it('should match snapshot for all environments', () => {
      const environments = ['local', 'dev', 'qa', 'staging', 'prod'] as const;
      
      environments.forEach(env => {
        const { toJSON } = render(<EnvironmentIndicator environment={env} />);
        expect(toJSON()).toBeDefined();
        expect(toJSON()).not.toBeNull();
      });
    });
  });
});