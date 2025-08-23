import { useEffect, useRef } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Text,
  Animated,
  Easing,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { CyberpunkGlitchBackground } from "./CyberpunkGlitchBackground";
import { gameUIColors } from '../../../rn-better-dev-tools/src/shared/ui/gameUI/constants/gameUIColors';

interface ClaudeGridMenuProps {
  visible: boolean;
  onClose: () => void;
  onQueryPress: () => void;
  onEnvPress: () => void;
  onSentryPress: () => void;
  onStoragePress: () => void;
  onWifiToggle: () => void;
  onNetworkPress?: () => void;
  isWifiEnabled?: boolean;
}

// Pure View-based icons
const QueryIcon = ({ color = gameUIColors.info, size = 24 }: { color?: string, size?: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: size * 0.75, fontWeight: 'bold' }}>Q</Text>
  </View>
);

const StorageIcon = ({ color = gameUIColors.warning, size = 24 }: { color?: string, size?: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: size * 0.75, fontWeight: 'bold' }}>S</Text>
  </View>
);

const DebugIcon = ({ color = gameUIColors.error, size = 24 }: { color?: string, size?: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: size * 0.75, fontWeight: 'bold' }}>D</Text>
  </View>
);

const EnvIcon = ({ color = gameUIColors.success, size = 24 }: { color?: string, size?: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: size * 0.75, fontWeight: 'bold' }}>E</Text>
  </View>
);

const WifiIcon = ({ color = gameUIColors.optional, enabled = true, size = 24 }: { color?: string, enabled?: boolean, size?: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: size * 0.75, fontWeight: 'bold' }}>{enabled ? 'W' : 'X'}</Text>
  </View>
);

const NetworkIcon = ({ color = gameUIColors.network, size = 24 }: { color?: string, size?: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: size * 0.75, fontWeight: 'bold' }}>N</Text>
  </View>
);

const CloseIcon = ({ color = gameUIColors.muted, size = 30 }: { color?: string, size?: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: size * 0.75, fontWeight: 'bold' }}>✕</Text>
  </View>
);

export function ClaudeGridMenu({
  visible,
  onClose,
  onQueryPress,
  onEnvPress,
  onSentryPress,
  onStoragePress,
  onWifiToggle,
  onNetworkPress,
  isWifiEnabled = true,
}: ClaudeGridMenuProps) {

  // Create animated values for each item
  const items = useRef(
    Array.from({ length: 6 }, () => ({
      scale: new Animated.Value(0),
      rotation: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
      glitch: new Animated.Value(0),
      magnetX: new Animated.Value(0),
      magnetY: new Animated.Value(0),
      pulse: new Animated.Value(0),
      shadowIntensity: new Animated.Value(0),
      matrixGlow: new Animated.Value(0),
      glitchX: new Animated.Value(0),
      glitchY: new Animated.Value(0),
      glitchOpacity: new Animated.Value(0),
      glitchScale: new Animated.Value(1),
    }))
  ).current;

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scanlinePosition = useRef(new Animated.Value(0)).current;

  const getHexPosition = (index: number) => {
    const angle = (index * Math.PI * 2) / 6;
    const radius = 120; // Increased spacing between buttons
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  const handleOpen = () => {
    // Backdrop fade in
    Animated.timing(backdropOpacity, {
      toValue: 0.9,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Start scanline animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanlinePosition, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(scanlinePosition, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Staggered item animations
    items.forEach((item, index) => {
      const delay = index * 50;
      const position = getHexPosition(index);

      // Initial glitch effect
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Glitch in
          Animated.sequence([
            Animated.timing(item.glitchOpacity, {
              toValue: 1,
              duration: 50,
              useNativeDriver: false,
            }),
            Animated.timing(item.glitchOpacity, {
              toValue: 0,
              duration: 50,
              useNativeDriver: false,
            }),
            Animated.timing(item.glitchOpacity, {
              toValue: 1,
              duration: 50,
              useNativeDriver: false,
            }),
            Animated.timing(item.glitchOpacity, {
              toValue: 0,
              duration: 50,
              useNativeDriver: false,
            }),
          ]),
          // Scale and position
          Animated.spring(item.scale, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: false,
          }),
          Animated.spring(item.translateX, {
            toValue: position.x,
            friction: 8,
            tension: 40,
            useNativeDriver: false,
          }),
          Animated.spring(item.translateY, {
            toValue: position.y,
            friction: 8,
            tension: 40,
            useNativeDriver: false,
          }),
          Animated.timing(item.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
        ]),
      ]).start();

      // Continuous pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(item.pulse, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(item.pulse, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    });
  };

  const handleClose = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      ...items.map((item) =>
        Animated.parallel([
          Animated.timing(item.scale, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(item.opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start(() => {
      // Reset positions
      items.forEach((item) => {
        item.translateX.setValue(0);
        item.translateY.setValue(0);
      });
    });
  };

  useEffect(() => {
    if (visible) {
      handleOpen();
    } else {
      handleClose();
    }
  }, [visible]);

  const menuItems = [
    {
      icon: <QueryIcon size={30} />,
      label: "Query",
      color: gameUIColors.query,
      onPress: onQueryPress,
    },
    {
      icon: <EnvIcon size={30} />,
      label: "Env",
      color: gameUIColors.env,
      onPress: onEnvPress,
    },
    {
      icon: <DebugIcon size={30} />,
      label: "Debug",
      color: gameUIColors.debug,
      onPress: onSentryPress,
    },
    {
      icon: <StorageIcon size={30} />,
      label: "Storage",
      color: gameUIColors.storage,
      onPress: onStoragePress,
    },
    {
      icon: <WifiIcon size={30} enabled={isWifiEnabled} />,
      label: "WiFi",
      color: isWifiEnabled ? gameUIColors.success : gameUIColors.error,
      onPress: onWifiToggle,
    },
    {
      icon: <NetworkIcon size={30} />,
      label: "Network",
      color: gameUIColors.network,
      onPress: onNetworkPress || (() => {}),
    },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        >
          <CyberpunkGlitchBackground />
          
          <View style={styles.menuContainer}>
            {/* Close button */}
            <Pressable
              style={styles.closeButton}
              onPress={onClose}
            >
              <CloseIcon size={30} />
            </Pressable>

            {/* Menu items */}
            {menuItems.map((item, index) => {
              const animatedItem = items[index];
              if (!animatedItem) return null;
              const pulseScale = animatedItem.pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1],
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.menuItem,
                    {
                      transform: [
                        { translateX: animatedItem.translateX },
                        { translateY: animatedItem.translateY },
                        { scale: Animated.multiply(animatedItem.scale, pulseScale) },
                      ],
                      opacity: animatedItem.opacity,
                    },
                  ]}
                >
                  <Pressable
                    style={[
                      styles.menuButton,
                      {
                        backgroundColor: gameUIColors.panel,
                        borderColor: item.color,
                      },
                    ]}
                    onPress={() => {
                      item.onPress();
                      setTimeout(onClose, 150);
                    }}
                  >
                    {item.icon}
                    <Text style={[styles.menuLabel, { color: item.color }]}>
                      {item.label}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  menuContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: gameUIColors.panel,
    borderWidth: 2,
    borderColor: gameUIColors.muted,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    elevation: 10,
    shadowColor: gameUIColors.muted,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  menuItem: {
    position: "absolute",
    width: 90,
    height: 90,
  },
  menuButton: {
    width: 90,
    height: 90,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 0.5,
  },
});

export default ClaudeGridMenu;