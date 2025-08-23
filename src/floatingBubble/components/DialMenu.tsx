import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  Dimensions,
  Text,
  Animated,
  Easing,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { gameUIColors, getThemedDialColors, THEME_ACCENT } from '../../../rn-better-dev-tools/src/shared/ui/gameUI/constants/gameUIColors';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CIRCLE_SIZE = Math.min(SCREEN_WIDTH * 0.75, 320); // Max 320px for better fit
const BUTTON_SIZE = 80; // Fixed button size

export type IconType = {
  name: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
};

interface DialMenuProps {
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

// Pure View-based icons (no SVG dependencies)
const QueryIcon = ({ color = gameUIColors.info }: { color?: string }) => (
  <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>Q</Text>
  </View>
);

const StorageIcon = ({ color = gameUIColors.warning }: { color?: string }) => (
  <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>S</Text>
  </View>
);

const DebugIcon = ({ color = gameUIColors.error }: { color?: string }) => (
  <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>D</Text>
  </View>
);

const EnvIcon = ({ color = gameUIColors.success }: { color?: string }) => (
  <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>E</Text>
  </View>
);

const WifiIcon = ({ color = gameUIColors.optional, enabled = true }: { color?: string, enabled?: boolean }) => (
  <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>{enabled ? 'W' : 'X'}</Text>
  </View>
);

const NetworkIcon = ({ color = gameUIColors.network }: { color?: string }) => (
  <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>N</Text>
  </View>
);

const CloseIcon = ({ color = gameUIColors.muted }: { color?: string }) => (
  <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>✕</Text>
  </View>
);

const DialMenu: React.FC<DialMenuProps> = ({
  visible,
  onClose,
  onQueryPress,
  onEnvPress,
  onSentryPress,
  onStoragePress,
  onWifiToggle,
  onNetworkPress,
  isWifiEnabled = true,
}) => {
  const [selectedIcon, setSelectedIcon] = useState(-1);

  // React Native Animated values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const dialScale = useRef(new Animated.Value(0)).current;
  const dialRotation = useRef(new Animated.Value(0)).current;
  const centerButtonScale = useRef(new Animated.Value(0)).current;
  const iconsProgress = useRef(new Animated.Value(0)).current;
  const breathingScale = useRef(new Animated.Value(1)).current;

  const icons: IconType[] = [
    {
      name: "Query",
      icon: <QueryIcon />,
      color: gameUIColors.query,
      onPress: onQueryPress,
    },
    {
      name: "Env",
      icon: <EnvIcon />,
      color: gameUIColors.env,
      onPress: onEnvPress,
    },
    {
      name: "Debug",
      icon: <DebugIcon />,
      color: gameUIColors.debug,
      onPress: onSentryPress,
    },
    {
      name: "Storage",
      icon: <StorageIcon />,
      color: gameUIColors.storage,
      onPress: onStoragePress,
    },
    {
      name: "WiFi",
      icon: <WifiIcon enabled={isWifiEnabled} />,
      color: isWifiEnabled ? gameUIColors.success : gameUIColors.error,
      onPress: onWifiToggle,
    },
  ];

  if (onNetworkPress) {
    icons.push({
      name: "Network",
      icon: <NetworkIcon />,
      color: gameUIColors.network,
      onPress: onNetworkPress,
    });
  }

  useEffect(() => {
    if (visible) {
      // Opening animations
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.spring(dialScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(dialRotation, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(centerButtonScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(iconsProgress, {
          toValue: 1,
          duration: 400,
          delay: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start();

      // Start breathing animation
      const breathingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(breathingScale, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breathingScale, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      breathingAnimation.start();
    } else {
      // Closing animations
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(dialScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(centerButtonScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const renderIcon = (icon: IconType, index: number) => {
    const angle = (index * (Math.PI * 2)) / icons.length - Math.PI / 2;
    const x = Math.cos(angle) * (CIRCLE_SIZE / 2.5);
    const y = Math.sin(angle) * (CIRCLE_SIZE / 2.5);

    const isSelected = selectedIcon === index;
    const iconScale = iconsProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.iconContainer,
          {
            transform: [
              { translateX: x },
              { translateY: y },
              { scale: iconScale },
            ],
          },
        ]}
      >
        <Pressable
          onPress={() => {
            setSelectedIcon(index);
            icon.onPress();
            setTimeout(onClose, 150);
          }}
          style={[
            styles.iconButton,
            {
              backgroundColor: isSelected ? icon.color : gameUIColors.buttonBackground,
              borderColor: icon.color,
            },
          ]}
        >
          {icon.icon}
          <Text style={[styles.iconLabel, { color: icon.color }]}>
            {icon.name}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  const dialColors = getThemedDialColors(THEME_ACCENT);

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
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <Animated.View
                style={[
                  styles.dialContainer,
                  {
                    transform: [
                      { scale: dialScale },
                      {
                        rotate: dialRotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {/* Background circle */}
                <View
                  style={[
                    styles.circle,
                    {
                      backgroundColor: dialColors.dialBackground,
                      borderColor: dialColors.dialBorder,
                    },
                  ]}
                />
                
                {/* Icons */}
                {icons.map((icon, index) => renderIcon(icon, index))}
                
                {/* Center close button */}
                <Animated.View
                  style={[
                    styles.centerButton,
                    {
                      transform: [{ scale: centerButtonScale }],
                    },
                  ]}
                >
                  <Pressable onPress={onClose} style={styles.closeButton}>
                    <CloseIcon />
                  </Pressable>
                </Animated.View>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  dialContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    position: "absolute",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    opacity: 0.9,
  },
  iconContainer: {
    position: "absolute",
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  iconButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  iconLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
  },
  centerButton: {
    position: "absolute",
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: gameUIColors.panel,
    borderWidth: 2,
    borderColor: gameUIColors.muted,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default DialMenu;