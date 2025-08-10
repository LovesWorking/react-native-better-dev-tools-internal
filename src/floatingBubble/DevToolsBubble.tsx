import { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  View,
  type ViewStyle,
} from 'react-native';
import { GripVerticalIcon } from '../icons/lucide-icons';
import { UserStatus } from './components/UserStatus';
import { EnvironmentIndicator } from './components/EnvironmentIndicator';
import { Divider } from './components/Divider';
import type { DevToolsBubbleProps } from './types';

export function DevToolsBubble({
  userRole,
  environment,
  hideEnvironment = false,
  hideUserStatus = false,
  onStatusPress,
  // onEnvironmentPress, // TODO: Implement environment press handler
}: DevToolsBubbleProps) {
  const animatedPosition = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        animatedPosition.setOffset({
          x: (animatedPosition.x as any).__getValue(),
          y: (animatedPosition.y as any).__getValue(),
        });
        animatedPosition.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: animatedPosition.x, dy: animatedPosition.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        setIsDragging(false);
        animatedPosition.flattenOffset();
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        animatedPosition.flattenOffset();
      },
    })
  ).current;

  const bubbleStyle: Animated.WithAnimatedObject<ViewStyle> = {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1001,
    transform: [
      { translateX: animatedPosition.x },
      { translateY: animatedPosition.y },
    ],
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171717',
    borderRadius: 6,
    borderWidth: isDragging ? 2 : 1,
    borderColor: isDragging ? 'rgba(34, 197, 94, 1)' : 'rgba(75, 85, 99, 0.4)',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: isDragging ? 'rgba(34, 197, 94, 0.6)' : '#000',
    shadowOffset: { width: 0, height: isDragging ? 6 : 4 },
    shadowOpacity: isDragging ? 0.6 : 0.3,
    shadowRadius: isDragging ? 12 : 8,
  };

  const dragHandleStyle: ViewStyle = {
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    borderRightWidth: 1,
    borderRightColor: 'rgba(75, 85, 99, 0.4)',
  };

  const shouldShowEnvironment = !hideEnvironment && environment;
  const shouldShowUserStatus = !hideUserStatus && userRole;
  const showDivider = shouldShowEnvironment && shouldShowUserStatus;

  const contentStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  };

  return (
    <Animated.View style={bubbleStyle}>
      <View style={containerStyle} {...panResponder.panHandlers}>
        <View style={dragHandleStyle}>
          <GripVerticalIcon size={12} color="rgba(156, 163, 175, 0.8)" />
        </View>
        
        <View style={contentStyle}>
          {shouldShowEnvironment && (
            <EnvironmentIndicator environment={environment} />
          )}
          
          {showDivider && <Divider />}
          
          {shouldShowUserStatus && (
            <UserStatus
              userRole={userRole}
              onPress={onStatusPress}
              isDragging={isDragging}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
}