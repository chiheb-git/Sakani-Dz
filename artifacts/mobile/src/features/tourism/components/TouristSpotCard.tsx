import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../../../shared/theme/theme";
import type { TouristSpot } from "@workspace/api-zod";

export default function TouristSpotCard({ spot, onPress }: { spot: TouristSpot; onPress: () => void }) {
  const photo = spot.photos?.[0];

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="map" size={36} color={colors.textMuted} />
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
    </TouchableOpacity>
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
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  body: { padding: spacing.md },
  name: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
  wilayaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: spacing.xs },
  wilaya: { ...typography.bodyMedium, color: colors.textSecondary },
  description: { ...typography.caption, color: colors.textSecondary },
});