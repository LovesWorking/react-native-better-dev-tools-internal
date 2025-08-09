# React Native PanResponder Examples

This example demonstrates how to use React Native's `PanResponder` API to create draggable components with gesture handling.

## 🎯 What is PanResponder?

`PanResponder` reconciles several touches into a single gesture. It makes single-touch gestures resilient to extra touches and can recognize basic multi-touch gestures. It's the foundation for building complex gesture-based interactions in React Native.

## 📦 Components

### 1. DraggableBox (Simple Implementation)

The simplest possible draggable component - perfect for most use cases:

```tsx
import React, { useRef } from 'react';
import { Animated, PanResponder } from 'react-native';

export function DraggableBox() {
  const animatedPosition = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () =>
        animatedPosition.setOffset({
          x: animatedPosition.x.__getValue(),
          y: animatedPosition.y.__getValue(),
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
```

#### Key Concepts:
- **`onStartShouldSetPanResponder`**: Returns `true` to claim touch responsiveness
- **`onPanResponderGrant`**: Sets offset when gesture starts to maintain position
- **`onPanResponderMove`**: Updates position using `Animated.event` for smooth animation
- **`onPanResponderRelease`**: Flattens offset when gesture ends

### 2. ExampleBubble (Advanced Implementation)

A comprehensive example showing all PanResponder callbacks with visual feedback:

```tsx
import { ExampleBubble } from 'react-native-better-dev-tools-internal';

// Shows:
// - All 13 PanResponder callbacks
// - Real-time gesture state display
// - Visual feedback with color changes
// - Callback history log
```

## 🔑 Core PanResponder Callbacks

### Essential Callbacks (Used in Simple Implementation)

| Callback | Purpose | Return Value |
|----------|---------|--------------|
| `onStartShouldSetPanResponder` | Should this view become responder on touch start? | `boolean` |
| `onPanResponderGrant` | Gesture has started, show visual feedback | `void` |
| `onPanResponderMove` | Touch is moving, update position | `void` |
| `onPanResponderRelease` | User released all touches, gesture complete | `void` |

### Additional Callbacks (For Complex Scenarios)

| Callback | When It Fires |
|----------|---------------|
| `onMoveShouldSetPanResponder` | Should become responder on move (not start)? |
| `onPanResponderReject` | Another responder is active and won't release |
| `onPanResponderStart` | Touch started (after grant) |
| `onPanResponderEnd` | Touch ended (before release) |
| `onPanResponderTerminate` | Another component became responder |
| `onPanResponderTerminationRequest` | Another component wants to become responder |
| `onShouldBlockNativeResponder` | Block native components (Android only) |

## 📊 Gesture State Object

Each callback receives a `gestureState` object with these properties:

```typescript
interface PanResponderGestureState {
  stateID: number;              // Unique ID for this gesture
  moveX: number;                // Latest screen X coordinate
  moveY: number;                // Latest screen Y coordinate
  x0: number;                   // Initial screen X coordinate
  y0: number;                   // Initial screen Y coordinate
  dx: number;                   // Accumulated X distance from start
  dy: number;                   // Accumulated Y distance from start
  vx: number;                   // Current X velocity
  vy: number;                   // Current Y velocity
  numberActiveTouches: number;  // Number of touches on screen
}
```

## 💡 Best Practices

### DO:
- ✅ Use `useRef` for PanResponder to avoid recreating on every render
- ✅ Use `Animated.ValueXY()` for smooth position tracking
- ✅ Set `useNativeDriver: false` for transform animations
- ✅ Call `setOffset()` in `onPanResponderGrant` to maintain position
- ✅ Call `flattenOffset()` in `onPanResponderRelease` to consolidate values

### DON'T:
- ❌ Don't recreate PanResponder on every render (use `useRef`)
- ❌ Don't forget to spread `{...panResponder.panHandlers}` on your View
- ❌ Don't rely on `numberActiveTouches` unless you're the responder
- ❌ Don't use `useState` for position tracking (use `Animated.Value`)

## 🚀 Usage Examples

### Basic Draggable Component
```tsx
import { DraggableBox } from 'react-native-better-dev-tools-internal';

export default function App() {
  return <DraggableBox />;
}
```

### With Custom Styling
```tsx
<Animated.View
  {...panResponder.panHandlers}
  style={{
    width: 100,
    height: 100,
    backgroundColor: 'blue',
    borderRadius: 50,
    transform: [
      { translateX: animatedPosition.x },
      { translateY: animatedPosition.y },
    ],
  }}
/>
```

### Constraining Movement
```tsx
onPanResponderMove: (evt, gestureState) => {
  // Constrain to horizontal movement only
  animatedPosition.setValue({
    x: gestureState.dx,
    y: 0,
  });
}
```

### With Boundaries
```tsx
onPanResponderMove: (evt, gestureState) => {
  const maxX = 200;
  const maxY = 200;
  
  animatedPosition.setValue({
    x: Math.min(Math.max(0, gestureState.dx), maxX),
    y: Math.min(Math.max(0, gestureState.dy), maxY),
  });
}
```

## 🔧 Troubleshooting

### Component not responding to touches
- Ensure `onStartShouldSetPanResponder` returns `true`
- Check that `{...panResponder.panHandlers}` is spread on the View
- Verify no parent component is capturing touches

### Jumpy animation
- Use `setOffset()` in `onPanResponderGrant`
- Call `flattenOffset()` in `onPanResponderRelease`
- Set initial position with `setValue({x: 0, y: 0})` after setting offset

### Position resets on drag
- Make sure to use `Animated.ValueXY()` not regular state
- Check that offset is being set correctly in `onPanResponderGrant`

## 📚 Learn More

- [Official PanResponder Documentation](https://reactnative.dev/docs/panresponder)
- [Gesture Responder System](https://reactnative.dev/docs/gesture-responder-system)
- [Animated API](https://reactnative.dev/docs/animated)

## 🎮 Try It Out

1. Run the example app:
   ```bash
   cd example
   yarn ios
   # or
   yarn android
   ```

2. Try the simple `DraggableBox` for basic dragging

3. Switch to `ExampleBubble` to see all callbacks in action

4. Experiment with the code and see how changes affect behavior