import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../../../shared/theme/theme";
import type { Site } from "@workspace/api-zod";

export default function SiteCard({ site, onPress }: { site: Site; onPress: () => void }) {
  const photo = site.photos?.[0];
  const count = site.propertyCount ?? 0;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="business" size={36} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.countBadge}>
          <Ionicons name="home" size={12} color="#fff" />
          <Text style={styles.countText}>
            {count} logement{count > 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {site.name}
        </Text>
        <View style={styles.wilayaRow}>
          <Ionicons name="location" size={14} color={colors.textSecondary} />
          <Text style={styles.wilaya}>{site.wilaya}</Text>
        </View>
        {site.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {site.description}
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
  imageWrapper: { width: "100%", height: 160, position: "relative", backgroundColor: colors.border },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  countBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.overlay,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  countText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  body: { padding: spacing.md },
  name: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
  wilayaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: spacing.xs },
  wilaya: { ...typography.bodyMedium, color: colors.textSecondary },
  description: { ...typography.caption, color: colors.textSecondary },
});