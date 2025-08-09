import Svg, { Circle, type SvgProps } from 'react-native-svg';

interface IconProps extends SvgProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const GripVerticalIcon = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...props
}: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Circle cx="9" cy="12" r="1" />
    <Circle cx="9" cy="5" r="1" />
    <Circle cx="9" cy="19" r="1" />
    <Circle cx="15" cy="12" r="1" />
    <Circle cx="15" cy="5" r="1" />
    <Circle cx="15" cy="19" r="1" />
  </Svg>
);