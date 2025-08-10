import { View, type ViewStyle } from 'react-native';

export function Divider() {
  const dividerStyle: ViewStyle = {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.4)',
    flexShrink: 0,
  };

  return <View style={dividerStyle} />;
}