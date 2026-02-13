import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { COLORS } from "../../legacyApp";

const SNACKBAR_HEIGHT = 48;
const SLIDE_DURATION = 300;
const AUTO_HIDE_DELAY = 3000;

/**
 * Top-positioned snackbar that listens to network connectivity changes.
 *
 * Mount once near the root of the app (e.g. in Main.js).
 * Slides down from behind the status bar when the connection state changes.
 */
export default function NetworkStatusSnackbar() {
  const { isOnline } = useOfflineStatus();
  const insets = useSafeAreaInsets();
  const prevOnline = useRef(isOnline);
  const isFirstRender = useRef(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef(null);
  const [banner, setBanner] = useState(null); // { text, bg }

  const show = (text, bg, autoHide) => {
    setBanner({ text, bg });

    Animated.timing(slideAnim, {
      toValue: 1,
      duration: SLIDE_DURATION,
      useNativeDriver: true,
    }).start();

    clearTimeout(hideTimer.current);
    if (autoHide) {
      hideTimer.current = setTimeout(hide, AUTO_HIDE_DELAY);
    }
  };

  const hide = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: SLIDE_DURATION,
      useNativeDriver: true,
    }).start(() => setBanner(null));
  };

  useEffect(() => {
    // Skip the very first render so we don't flash a banner on app launch.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevOnline.current = isOnline;
      return;
    }

    // Only show when the status actually changes.
    if (isOnline === prevOnline.current) return;
    prevOnline.current = isOnline;

    if (isOnline) {
      show("You are back online", COLORS.success, true);
    } else {
      // Stay visible while offline — no auto-hide.
      show(
        "You are offline. Some features may be unavailable.",
        COLORS.danger,
        false,
      );
    }

    return () => clearTimeout(hideTimer.current);
  }, [isOnline]);

  if (!banner) return null;

  const totalHeight = insets.top + SNACKBAR_HEIGHT;
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-totalHeight, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: banner.bg,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.text}>{banner.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "auto",
    minHeight: SNACKBAR_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
