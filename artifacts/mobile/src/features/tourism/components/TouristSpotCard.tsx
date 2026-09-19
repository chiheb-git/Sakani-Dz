import { View, Text, Image, StyleSheet } from "react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../../../shared/theme/theme";
import type { TouristSpot } from "@workspace/api-zod";
import AnimatedPressable from "../../../shared/components/AnimatedPressable";

export default function TouristSpotCard({ spot, onPress }: { spot: TouristSpot; onPress: () => void }) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const photo = spot.photos?.[0];
  const imageUri = photo && !imageFailed ? photo : null;

  return (
    <AnimatedPressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} onError={() => setImageFailed(true)} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="map" size={36} color={colors.textMuted} />
            <Text style={styles.imagePlaceholderText}>{t("tourism.imageUnavailable")}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {spot.name}
        </Text>
        <View style={styles.wilayaRow}>
          <Ionicons name="location" size={14} color={colors.textSecondary} />
          <Text style={styles.wilaya}>{spot.wilaya}</Text>
        </View>
        {spot.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {spot.description}
          </Text>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: "hidden",
    ...shadow.card,
  },
  imageWrapper: { width: "100%", height: 160, backgroundColor: colors.border },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { alignItems: "center", justifyContent: "center", gap: spacing.xs },
  imagePlaceholderText: { ...typography.caption, color: colors.textMuted },
  body: { padding: spacing.md },
  name: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
  wilayaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: spacing.xs },
  wilaya: { ...typography.bodyMedium, color: colors.textSecondary },
  description: { ...typography.caption, color: colors.textSecondary },
});