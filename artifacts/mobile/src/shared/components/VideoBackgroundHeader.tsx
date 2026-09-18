import { createElement, useEffect, useState } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { colors } from "../theme/theme";

const heroVideoSource = require("../../../assets/videos/hero-background.mp4");

export default function VideoBackgroundHeader({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const isWeb = Platform.OS === "web";
  const videoPlayer = useVideoPlayer(heroVideoSource, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  useEffect(() => {
    const subscription = videoPlayer.addListener("statusChange", ({ status }) => {
      if (status === "error") setVideoFailed(true);
    });
    return () => subscription.remove();
  }, [videoPlayer]);

  return (
    <View style={[styles.container, style]}>
      {!videoFailed && isWeb
        ? createElement("video", {
            src: heroVideoSource,
            autoPlay: true,
            muted: true,
            loop: true,
            playsInline: true,
            onError: () => setVideoFailed(true),
            style: styles.webVideo,
          })
        : null}
      {!videoFailed && !isWeb ? (
        <VideoView
          player={videoPlayer}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
      ) : null}
      <View style={styles.overlay} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.primary, overflow: "hidden", minHeight: 180 },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(4, 21, 36, 0.42)",
  },
  webVideo: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  } as any,
});