import React, { useRef, useState, useEffect, useMemo, createContext } from 'react';
import {
  Animated,
  PanResponder,
  View,
  Dimensions,
  Modal,
  type ViewStyle,
} from 'react-native';
import { UserStatus } from './components/UserStatus';
import { EnvironmentIndicator } from './components/EnvironmentIndicator';
import { Divider } from './components/Divider';
import { usePositionPersistence } from './hooks/usePositionPersistence';
import { PluginProvider, useEnabledPlugins, usePlugins } from './providers/PluginProvider';
import type { DevToolsBubbleProps } from './types';
import type { DevToolsPlugin, PluginContext } from './types/plugin';
import { gameUIColors } from '../../rn-better-dev-tools/src/shared/ui/gameUI/constants/gameUIColors';

// Pure View-based GripVerticalIcon (no SVG dependencies)
function GripVerticalIcon({
  size = 24,
  color = gameUIColors.secondary + "CC",
}: {
  size?: number;
  color?: string;
}) {
  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  };

  const dotSize = Math.max(2, Math.round(size / 6));
  const columnGap = Math.max(2, Math.round(size / 12));
  const rowGap = Math.max(2, Math.round(size / 12));

  const columnStyle: ViewStyle = {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: columnGap / 2,
  };

  const dotStyle: ViewStyle = {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: color,
    marginVertical: rowGap / 2,
  };

  return (
    <View style={containerStyle}>
      <View style={columnStyle}>
        <View style={dotStyle} />
        <View style={dotStyle} />
        <View style={dotStyle} />
      </View>
      <View style={columnStyle}>
        <View style={dotStyle} />
        <View style={dotStyle} />
        <View style={dotStyle} />
      </View>
    </View>
  );
}

// Context to avoid brittle prop threading and keep API composable
const FloatingToolsContext = createContext<{ isDragging: boolean }>({
  isDragging: false,
});

// Get safe area insets helper
function getSafeAreaInsets(): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  // For now, use default safe area values
  // TODO: Integrate with react-native-safe-area-context properly
  return { top: 20, bottom: 0, left: 0, right: 0 };
}

// Plugins are now provided externally via props

/**
 * Inner component that uses plugin context
 */
function DevToolsBubbleInner({
  userRole,
  environment,
  hideEnvironment = false,
  hideUserStatus = false,
  hideWifiToggle = false,
  enablePositionPersistence = true,
  onStatusPress,
  queryClient,
  plugins: _additionalPlugins = [],
}: DevToolsBubbleProps & { plugins?: DevToolsPlugin[] }) {
  const animatedPosition = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);
  const [bubbleSize, setBubbleSize] = useState({ width: 100, height: 32 });
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const safeAreaInsets = getSafeAreaInsets();
  
  const manager = usePlugins();
  const enabledPlugins = useEnabledPlugins();

  // Use position persistence hook
  const { savePosition } = usePositionPersistence({
    animatedPosition,
    bubbleWidth: bubbleSize.width,
    bubbleHeight: bubbleSize.height,
    enabled: enablePositionPersistence,
    visibleHandleWidth: 32,
  });

  // Check if bubble is in hidden position on load
  useEffect(() => {
    if (!enablePositionPersistence) return;

    const checkHiddenState = () => {
      const currentX = (animatedPosition.x as any).__getValue();
      const { width: screenWidth } = Dimensions.get('window');
      // Check if bubble is at the hidden position (showing only grabber)
      if (currentX >= screenWidth - 32 - 5) {
        setIsHidden(true);
      }
    };
    // Delay check to ensure position is loaded
    const timer = setTimeout(checkHiddenState, 100);
    return () => clearTimeout(timer);
  }, [enablePositionPersistence, animatedPosition]);

  // Default position when persistence disabled
  useEffect(() => {
    if (!enablePositionPersistence) {
      const { width: screenWidth } = Dimensions.get('window');
      animatedPosition.setValue({
        x: screenWidth - bubbleSize.width - 20,
        y: Math.max(100, safeAreaInsets.top + 20),
      });
    }
  }, [enablePositionPersistence, animatedPosition, bubbleSize.width, safeAreaInsets.top]);

  // Listen for modal open events from plugins
  useEffect(() => {
    const unsubscribe = manager.getEventEmitter().on('react-query:open-modal', () => {
      setActiveModal('react-query');
    });
    return () => unsubscribe();
  }, [manager]);

  const panResponder = useMemo(
    () =>
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
          let currentX = (animatedPosition.x as any).__getValue();
          let currentY = (animatedPosition.y as any).__getValue();
          const { width: screenWidth, height: screenHeight } =
            Dimensions.get('window');

          // Prevent dragging off left, top, and bottom edges with safe area
          const minX = safeAreaInsets.left;
          const minY = safeAreaInsets.top;
          const maxY = screenHeight - bubbleSize.height - safeAreaInsets.bottom;

          // Clamp Y position to prevent going off top/bottom
          currentY = Math.max(minY, Math.min(currentY, maxY));

          // Check if bubble is more than 50% over the right edge
          const bubbleMidpoint = currentX + bubbleSize.width / 2;
          const shouldHide = bubbleMidpoint > screenWidth;

          if (shouldHide) {
            // Animate to hidden position (only grabber visible)
            const hiddenX = screenWidth - 32; // Only show the 32px grabber
            setIsHidden(true);
            Animated.timing(animatedPosition, {
              toValue: { x: hiddenX, y: currentY },
              duration: 200,
              useNativeDriver: false,
            }).start(() => {
              savePosition(hiddenX, currentY);
            });
          } else {
            // Clamp X position to prevent going off left edge
            currentX = Math.max(minX, currentX);

            // Check if we're in hidden state and user is pulling it back
            if (isHidden && currentX < screenWidth - 32 - 10) {
              setIsHidden(false);
            }

            // Animate to the clamped position if needed
            if (
              currentX !== (animatedPosition.x as any).__getValue() ||
              currentY !== (animatedPosition.y as any).__getValue()
            ) {
              Animated.timing(animatedPosition, {
                toValue: { x: currentX, y: currentY },
                duration: 100,
                useNativeDriver: false,
              }).start(() => {
                savePosition(currentX, currentY);
              });
            } else {
              savePosition(currentX, currentY);
            }
          }
        },
        onPanResponderTerminate: () => {
          setIsDragging(false);
          animatedPosition.flattenOffset();
        },
      }),
    [
      animatedPosition,
      savePosition,
      bubbleSize.width,
      bubbleSize.height,
      isHidden,
      safeAreaInsets,
    ]
  );

  const bubbleStyle: Animated.WithAnimatedObject<ViewStyle> = useMemo(
    () => ({
      position: 'absolute',
      zIndex: 1001,
      transform: animatedPosition.getTranslateTransform(),
    }),
    [animatedPosition]
  );

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: gameUIColors.panel,
    borderRadius: 6,
    borderWidth: isDragging ? 2 : 1,
    borderColor: isDragging ? gameUIColors.info : gameUIColors.muted + "66",
    overflow: 'hidden',
    elevation: 8,
    shadowColor: isDragging ? gameUIColors.info + "99" : '#000',
    shadowOffset: { width: 0, height: isDragging ? 6 : 4 },
    shadowOpacity: isDragging ? 0.6 : 0.3,
    shadowRadius: isDragging ? 12 : 8,
  };

  const dragHandleStyle: ViewStyle = {
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: gameUIColors.muted + "1A",
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    borderRightWidth: 1,
    borderRightColor: gameUIColors.muted + "66",
  };

  const contentStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
  };

  const modalContainerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'flex-end',
  };

  // Create plugin context
  const pluginContext: PluginContext = {
    storage: manager.storage,
    events: manager.getEventEmitter(),
    queryClient,
    notifyHost: (event) => console.log('[Plugin Event]', event),
    getPlugin: (id) => manager.getPlugin(id),
  };

  // Backward compatibility: show legacy components if not hidden
  const shouldShowEnvironment = !hideEnvironment && environment;
  const shouldShowUserStatus = !hideUserStatus && userRole;

  // Filter plugins based on legacy props
  const visiblePlugins = enabledPlugins.filter(plugin => {
    // Hide wifi-toggle if hideWifiToggle is true
    if (plugin.id === 'wifi-toggle' && hideWifiToggle) {
      return false;
    }
    return true;
  });

  // Get active modal component
  const activeModalPlugin = activeModal ? manager.getPlugin(activeModal) : null;

  return (
    <>
      <Animated.View style={bubbleStyle}>
        <View
          style={containerStyle}
          {...panResponder.panHandlers}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setBubbleSize({ width, height });
          }}
        >
          <View style={dragHandleStyle}>
            <GripVerticalIcon size={12} color={gameUIColors.secondary + "CC"} />
          </View>

          <FloatingToolsContext.Provider value={{ isDragging }}>
            <View style={contentStyle}>
              {/* Legacy components for backward compatibility */}
              {shouldShowEnvironment && (
                <>
                  <EnvironmentIndicator environment={environment} />
                  <Divider />
                </>
              )}

              {shouldShowUserStatus && (
                <>
                  <UserStatus
                    userRole={userRole}
                    onPress={onStatusPress}
                    isDragging={isDragging}
                  />
                  <Divider />
                </>
              )}

              {/* Plugin components */}
              {visiblePlugins.map((plugin, index) => {
                if (!plugin.component) return null;
                
                const PluginComponent = plugin.component;
                return (
                  <React.Fragment key={plugin.id}>
                    <PluginComponent 
                      context={pluginContext} 
                      isDragging={isDragging}
                    />
                    {index < visiblePlugins.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </View>
          </FloatingToolsContext.Provider>
        </View>
      </Animated.View>

      {/* Modal for expanded plugin views */}
      {activeModalPlugin?.modalComponent && (
        <Modal
          visible={!!activeModal}
          transparent
          animationType="slide"
          onRequestClose={() => setActiveModal(null)}
        >
          <View style={modalContainerStyle}>
            <activeModalPlugin.modalComponent
              context={pluginContext}
              onClose={() => setActiveModal(null)}
            />
          </View>
        </Modal>
      )}
    </>
  );
}

/**
 * Enhanced DevToolsBubble with plugin support
 * Maintains backward compatibility with existing props
 */
export function DevToolsBubbleWithPlugins(props: DevToolsBubbleProps & { 
  plugins?: DevToolsPlugin[] 
}) {
  return (
    <PluginProvider 
      queryClient={props.queryClient}
      plugins={props.plugins || []}
      onHostEvent={(event) => console.log('[DevTools Host Event]', event)}
    >
      <DevToolsBubbleInner {...props} />
    </PluginProvider>
  );
}