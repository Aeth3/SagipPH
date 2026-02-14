import { COLORS } from "package/src/legacyApp"
import React, { useEffect, useMemo, useRef } from "react"
import { View, Text, ActivityIndicator, Animated, Easing, StyleSheet, Dimensions } from "react-native"
import LinearGradient from "react-native-linear-gradient"

const { width } = Dimensions.get("window")

export default function LoadingOverlay({ visible, text = "Please wait..." }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const shimmerAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  const shimmerLoopRef = useRef(null)
  const pulseLoopRef = useRef(null)

  useEffect(() => {
    if (visible) {
      shimmerAnim.setValue(0)
      pulseAnim.setValue(1)

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start()

      shimmerLoopRef.current = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      )

      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 700,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )

      shimmerLoopRef.current.start()
      pulseLoopRef.current.start()
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start()

      shimmerLoopRef.current?.stop()
      pulseLoopRef.current?.stop()
    }

    return () => {
      shimmerLoopRef.current?.stop()
      pulseLoopRef.current?.stop()
    }
  }, [fadeAnim, pulseAnim, shimmerAnim, visible])

  const translateX = useMemo(
    () =>
      shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-width * 1.2, width * 1.2],
      }),
    [shimmerAnim]
  )

  if (!visible) return null

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.backdrop} />

      <View style={styles.shimmerContainer} pointerEvents="none">
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              transform: [{ translateX }, { rotate: "10deg" }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0.14)",
              "rgba(255,255,255,0.28)",
              "rgba(255,255,255,0.14)",
              "rgba(255,255,255,0)",
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradient}
          />
        </Animated.View>
      </View>

      <Animated.View style={[styles.loaderCard, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient
          colors={["rgba(255,255,255,0.98)", "rgba(245,249,255,0.98)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loaderCardInner}
        >
          <View style={styles.loaderRow}>
            <View style={styles.textGroup}>
              <ActivityIndicator size="large" color={COLORS.primary2} />
              <Text style={styles.text}>{text}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 10, 22, 0.35)",
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  shimmerOverlay: {
    width: width * 1.6,
    height: "160%",
    marginTop: "-20%",
  },
  gradient: {
    flex: 1,
  },
  loaderCard: {
    width: Math.min(width * 0.4, 340),
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    overflow: "hidden",
  },
  loaderCardInner: {
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  loaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  textGroup: {
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary2,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: COLORS.primary2,
    lineHeight: 20,
  },
})
