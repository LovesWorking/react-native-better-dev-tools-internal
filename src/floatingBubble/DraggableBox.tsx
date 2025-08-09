import { useRef } from 'react';
import { Animated, PanResponder } from 'react-native';

export function DraggableBox() {
  const animatedPosition = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () =>
        animatedPosition.setOffset({
          x: (animatedPosition.x as any).__getValue(),
          y: (animatedPosition.y as any).__getValue(),
        }),
      onPanResponderMove: Animated.event(
        [null, { dx: animatedPosition.x, dy: animatedPosition.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => animatedPosition.flattenOffset(),
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        width: 80,
        height: 80,
        backgroundColor: 'tomato',
        borderRadius: 40,
        transform: [
          { translateX: animatedPosition.x },
          { translateY: animatedPosition.y },
        ],
      }}
    />
  );
}