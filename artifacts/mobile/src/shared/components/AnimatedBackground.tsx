import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/theme";

export default function AnimatedBackground({ children, fill = true }: { children: React.ReactNode; fill?: boolean }) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 9000, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 9000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [-24, 24] });
  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [12, -12] });

  return (
    <View style={[styles.container, fill && styles.fill]}>
      <LinearGradient colors={[colors.primary, colors.primaryLight, "#2D607C"]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.orb, styles.orbTop, { transform: [{ translateX }, { translateY }] }]} />
      <Animated.View style={[styles.orb, styles.orbBottom, { transform: [{ translateX: Animated.multiply(translateX, -0.55) }, { translateY: Animated.multiply(translateY, -0.7) }] }]} />
      <View style={[styles.content, fill && styles.fill]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden" },
  content: {},
  fill: { flex: 1 },
  orb: { position: "absolute", borderRadius: 999, opacity: 0.16 },
  orbTop: { width: 240, height: 240, right: -90, top: 52, backgroundColor: colors.accentLight },
  orbBottom: { width: 300, height: 300, left: -150, bottom: -110, backgroundColor: "#8FC6D3" },
});