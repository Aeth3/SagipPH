// FloatingAddButton.js
import { COLORS } from "package/src/legacyApp";
import React, { useRef } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  View,
  Text,
  Platform,
} from "react-native";

const FloatingAddButton = ({
  alignment = "right",
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getAlignmentStyle = () => {
    switch (alignment) {
      case "left":
        return { left: 24 };
      case "center":
        return { alignSelf: "center" };
      case "right":
      default:
        return { right: 24 };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getAlignmentStyle(),
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.button}
      >
        <Text style={styles.icon}>＋</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FloatingAddButton;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    zIndex: 100,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",

    // Modern gradient-style color
    backgroundColor: COLORS.primaryRed,

    // iOS Shadow
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,

    // Android Shadow
    elevation: 10,
  },
  icon: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "300",
    marginTop: -2,
  },
});
