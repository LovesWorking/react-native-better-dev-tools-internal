import { View, type ViewStyle } from 'react-native';
import { gameUIColors } from '../../../rn-better-dev-tools/src/shared/ui/gameUI/constants/gameUIColors';

export function Divider() {
  const dividerStyle: ViewStyle = {
    width: 1,
    height: 12,
    backgroundColor: gameUIColors.muted + "66",
    flexShrink: 0,
  };

  return <View style={dividerStyle} />;
}