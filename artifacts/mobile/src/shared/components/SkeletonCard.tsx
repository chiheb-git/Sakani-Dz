import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors, radius, shadow, spacing } from "../theme/theme";

export default function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(shimmer, { toValue: 0.9, duration: 850, useNativeDriver: true }),
      Animated.timing(shimmer, { toValue: 0.45, duration: 850, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.image, { opacity: shimmer }]} />
      <View style={styles.body}>
        <Animated.View style={[styles.line, styles.long, { opacity: shimmer }]} />
        <Animated.View style={[styles.line, styles.short, { opacity: shimmer }]} />
        <Animated.View style={[styles.line, styles.medium, { opacity: shimmer }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, marginHorizontal: spacing.md, marginBottom: spacing.md, overflow: "hidden", ...shadow.card },
  image: { height: 180, backgroundColor: colors.primarySoft },
  body: { padding: spacing.md, gap: spacing.sm },
  line: { height: 12, borderRadius: radius.full, backgroundColor: colors.backgroundElevated },
  long: { width: "68%" },
  medium: { width: "48%" },
  short: { width: "32%" },
});