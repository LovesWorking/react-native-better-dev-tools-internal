import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated } from "react-native";
const VIEW_SIZE = 6;
const VIEW_HEIGHT = VIEW_SIZE * 3;
const BUTTON_SIZE = 80;
const CIRCLE_RADIUS = BUTTON_SIZE / 2;
const START_ANGLE = (-1 * Math.PI) / 2;
const PADDING = 15;

interface Props {
  selectedIcon: number;
}

const DialIndicator: React.FC<Props> = ({ selectedIcon }) => {
  const ANGLE_PER_VIEW = (2 * Math.PI) / 6; // 6 icons with close button
  
  const animatedX = useRef(new Animated.Value(0)).current;
  const animatedY = useRef(new Animated.Value(0)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const angle = START_ANGLE + ANGLE_PER_VIEW * selectedIcon;
    const x =
      CIRCLE_RADIUS +
      (CIRCLE_RADIUS - VIEW_HEIGHT / 2 - PADDING) * Math.cos(angle) -
      VIEW_SIZE / 2;
    const y =
      CIRCLE_RADIUS +
      (CIRCLE_RADIUS - VIEW_HEIGHT / 2 - PADDING) * Math.sin(angle) -
      VIEW_HEIGHT / 2;
    const rotation = angle + Math.PI / 2;
    
    Animated.parallel([
      Animated.spring(animatedX, {
        toValue: x,
        damping: 15,
        stiffness: 200,
        useNativeDriver: false,
      }),
      Animated.spring(animatedY, {
        toValue: y,
        damping: 15,
        stiffness: 200,
        useNativeDriver: false,
      }),
      Animated.timing(animatedRotation, {
        toValue: rotation,
        duration: 0,
        useNativeDriver: false,
      }),
    ]).start();
  }, [selectedIcon, animatedX, animatedY, animatedRotation]);

  const animatedStyle = {
    top: animatedY,
    left: animatedX,
    transform: [
      {
        rotate: animatedRotation.interpolate({
          inputRange: [0, 2 * Math.PI],
          outputRange: ['0rad', `${2 * Math.PI}rad`],
        }),
      },
    ],
  };

  return (
    <>
      {/* Main indicator */}
      <Animated.View style={[styles.view, animatedStyle]} />
      
      {/* Glow effect */}
      <Animated.View style={[styles.viewGlow, animatedStyle]} />
    </>
  );
};

const styles = StyleSheet.create({
  view: {
    width: VIEW_SIZE,
    height: VIEW_HEIGHT,
    backgroundColor: "#00FFFF",
    position: "absolute",
    borderRadius: VIEW_SIZE / 2,
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  viewGlow: {
    width: VIEW_SIZE * 1.5,
    height: VIEW_HEIGHT * 1.2,
    backgroundColor: "rgba(0, 255, 255, 0.3)",
    position: "absolute",
    borderRadius: VIEW_SIZE,
    left: -VIEW_SIZE * 0.25,
    top: -VIEW_HEIGHT * 0.1,
  },
});

export default DialIndicator;