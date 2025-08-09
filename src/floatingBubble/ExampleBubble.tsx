import { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  View,
  Text,
  StyleSheet,
  ScrollView,
  type PanResponderGestureState,
  type GestureResponderEvent,
} from 'react-native';

interface CallbackEvent {
  name: string;
  timestamp: number;
  gestureState?: Partial<PanResponderGestureState>;
}

export function ExampleBubble() {
  const animatedPosition = useRef(new Animated.ValueXY()).current;
  const [currentGestureState, setCurrentGestureState] = useState<
    Partial<PanResponderGestureState>
  >({});
  const [callbackHistory, setCallbackHistory] = useState<CallbackEvent[]>([]);
  const [responderStatus, setResponderStatus] = useState<string>(
    'Waiting for touch...'
  );
  const [backgroundColor, setBackgroundColor] = useState('tomato');

  const addCallbackEvent = (
    eventName: string,
    gestureState?: PanResponderGestureState
  ) => {
    const event: CallbackEvent = {
      name: eventName,
      timestamp: Date.now(),
      gestureState: gestureState
        ? {
            stateID: gestureState.stateID,
            moveX: Math.round(gestureState.moveX),
            moveY: Math.round(gestureState.moveY),
            x0: Math.round(gestureState.x0),
            y0: Math.round(gestureState.y0),
            dx: Math.round(gestureState.dx),
            dy: Math.round(gestureState.dy),
            vx: Math.round(gestureState.vx * 100) / 100,
            vy: Math.round(gestureState.vy * 100) / 100,
            numberActiveTouches: gestureState.numberActiveTouches,
          }
        : undefined,
    };

    setCallbackHistory((prev) => [...prev.slice(-9), event]);
    if (gestureState) {
      setCurrentGestureState(event.gestureState!);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        addCallbackEvent('onStartShouldSetPanResponder → true', gestureState);
        return true;
      },

      onStartShouldSetPanResponderCapture: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        addCallbackEvent(
          'onStartShouldSetPanResponderCapture → true',
          gestureState
        );
        return true;
      },

      onMoveShouldSetPanResponder: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        addCallbackEvent('onMoveShouldSetPanResponder → true', gestureState);
        return true;
      },

      onMoveShouldSetPanResponderCapture: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        addCallbackEvent(
          'onMoveShouldSetPanResponderCapture → true',
          gestureState
        );
        return true;
      },

      onPanResponderGrant: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        addCallbackEvent(
          '✅ onPanResponderGrant (Gesture Started!)',
          gestureState
        );
        setResponderStatus('Responder GRANTED - Gesture Active');
        setBackgroundColor('#4CAF50');

        animatedPosition.setOffset({
          x: (animatedPosition.x as any).__getValue(),
          y: (animatedPosition.y as any).__getValue(),
        });

        animatedPosition.setValue({ x: 0, y: 0 });
      },

      onPanResponderReject: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        addCallbackEvent(
          '❌ onPanResponderReject (Request Denied)',
          gestureState
        );
        setResponderStatus('Responder REJECTED');
        setBackgroundColor('#F44336');
      },

      onPanResponderStart: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        addCallbackEvent('▶️ onPanResponderStart', gestureState);
        setBackgroundColor('#2196F3');
      },

      onPanResponderMove: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        addCallbackEvent('🔄 onPanResponderMove', gestureState);

        Animated.event(
          [null, { dx: animatedPosition.x, dy: animatedPosition.y }],
          { useNativeDriver: false }
        )(evt, gestureState);

        setCurrentGestureState({
          stateID: gestureState.stateID,
          moveX: Math.round(gestureState.moveX),
          moveY: Math.round(gestureState.moveY),
          x0: Math.round(gestureState.x0),
          y0: Math.round(gestureState.y0),
          dx: Math.round(gestureState.dx),
          dy: Math.round(gestureState.dy),
          vx: Math.round(gestureState.vx * 100) / 100,
          vy: Math.round(gestureState.vy * 100) / 100,
          numberActiveTouches: gestureState.numberActiveTouches,
        });
      },

      onPanResponderEnd: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        addCallbackEvent('⏹️ onPanResponderEnd', gestureState);
      },

      onPanResponderRelease: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        addCallbackEvent('🎯 onPanResponderRelease (Success!)', gestureState);
        setResponderStatus('Released - Gesture Complete');
        setBackgroundColor('tomato');

        animatedPosition.flattenOffset();
      },

      onPanResponderTerminationRequest: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        addCallbackEvent('⚠️ onPanResponderTerminationRequest', gestureState);
        return true;
      },

      onPanResponderTerminate: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        addCallbackEvent(
          '🛑 onPanResponderTerminate (Cancelled)',
          gestureState
        );
        setResponderStatus('Terminated - Another component took control');
        setBackgroundColor('#FF9800');

        animatedPosition.flattenOffset();
      },

      onShouldBlockNativeResponder: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        addCallbackEvent(
          '🚫 onShouldBlockNativeResponder → true',
          gestureState
        );
        return true;
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.bubble,
          {
            backgroundColor,
            transform: [
              { translateX: animatedPosition.x },
              { translateY: animatedPosition.y },
            ],
          },
        ]}
      >
        <Text style={styles.bubbleText}>Drag Me!</Text>
      </Animated.View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Responder Status:</Text>
        <Text style={styles.statusText}>{responderStatus}</Text>
      </View>

      <View style={styles.gestureStateContainer}>
        <Text style={styles.sectionTitle}>Current Gesture State:</Text>
        <View style={styles.stateGrid}>
          <View style={styles.stateItem}>
            <Text style={styles.stateLabel}>State ID:</Text>
            <Text style={styles.stateValue}>
              {currentGestureState.stateID ?? '-'}
            </Text>
          </View>
          <View style={styles.stateItem}>
            <Text style={styles.stateLabel}>Active Touches:</Text>
            <Text style={styles.stateValue}>
              {currentGestureState.numberActiveTouches ?? 0}
            </Text>
          </View>
          <View style={styles.stateItem}>
            <Text style={styles.stateLabel}>Move Position:</Text>
            <Text style={styles.stateValue}>
              ({currentGestureState.moveX ?? 0},{' '}
              {currentGestureState.moveY ?? 0})
            </Text>
          </View>
          <View style={styles.stateItem}>
            <Text style={styles.stateLabel}>Start Position:</Text>
            <Text style={styles.stateValue}>
              ({currentGestureState.x0 ?? 0}, {currentGestureState.y0 ?? 0})
            </Text>
          </View>
          <View style={styles.stateItem}>
            <Text style={styles.stateLabel}>Distance (dx, dy):</Text>
            <Text style={styles.stateValue}>
              ({currentGestureState.dx ?? 0}, {currentGestureState.dy ?? 0})
            </Text>
          </View>
          <View style={styles.stateItem}>
            <Text style={styles.stateLabel}>Velocity (vx, vy):</Text>
            <Text style={styles.stateValue}>
              ({currentGestureState.vx ?? 0}, {currentGestureState.vy ?? 0})
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Callback History (Latest 10):</Text>
        <ScrollView style={styles.historyScroll}>
          {callbackHistory.map((event, index) => (
            <View
              key={`${event.timestamp}-${index}`}
              style={styles.historyItem}
            >
              <Text style={styles.historyText}>{event.name}</Text>
              {event.gestureState && (
                <Text style={styles.historyDetail}>
                  dx: {event.gestureState.dx}, dy: {event.gestureState.dy}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>PanResponder Behavior:</Text>
        <Text style={styles.instructionsText}>
          • Touch to trigger onStartShouldSetPanResponder{'\n'}• Drag to see
          onPanResponderMove events{'\n'}• Release to trigger
          onPanResponderRelease{'\n'}• Green = Granted, Blue = Moving, Red =
          Rejected{'\n'}• Orange = Terminated by another component
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  bubble: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  bubbleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusContainer: {
    marginTop: 100,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 16,
    color: '#2196F3',
  },
  gestureStateContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  stateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stateItem: {
    width: '50%',
    marginBottom: 8,
  },
  stateLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  stateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  historyContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    maxHeight: 200,
  },
  historyScroll: {
    flex: 1,
  },
  historyItem: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyText: {
    fontSize: 12,
    color: '#333',
  },
  historyDetail: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  instructionsContainer: {
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1976d2',
  },
  instructionsText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
});
