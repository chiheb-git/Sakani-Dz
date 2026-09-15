import { useRef, type ReactNode } from "react";
import { Animated, Pressable, type PressableProps, type StyleProp, StyleSheet, type ViewStyle } from "react-native";

type AnimatedPressableProps = Omit<PressableProps, "children" | "style"> & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function AnimatedPressable({ children, style, ...props }: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      {...props}
      onPressIn={(event) => {
        Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 30, bounciness: 5 }).start();
        props.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 24, bounciness: 8 }).start();
        props.onPressOut?.(event);
      }}
    >
      <Animated.View style={[styles.fill, style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({ fill: { alignSelf: "stretch" } });