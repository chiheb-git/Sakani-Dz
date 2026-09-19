import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../../../shared/theme/theme";
import { useListFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation, useAddHistoryEntryMutation } from "../../../core/api/apiSlice";
import type { Property } from "@workspace/api-zod";
import AnimatedPressable from "../../../shared/components/AnimatedPressable";

function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(price)} DA`;
}

function typeLabel(property: Property): string {
  if (property.type === "apartment" && property.apartmentType) return property.apartmentType;
  if (property.type === "villa") return "Villa";
  return property.type;
}

export default function PropertyCard({
  property,
  onPress,
}: {
  property: Property;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const photo = property.photos?.[0];

  const { data: favoritesData } = useListFavoritesQuery();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const [addHistoryEntry] = useAddHistoryEntryMutation();
  const isFavorite = favoritesData?.data.some((f) => f.propertyId === property.id) ?? false;

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(property.id);
    } else {
      addFavorite({ propertyId: property.id });
      addHistoryEntry({ entryType: "property", propertyId: property.id }).catch(() => {});
    }
  };

  return (
    <View style={styles.card}>
      <AnimatedPressable onPress={onPress}>
        <View style={styles.imageWrapper}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="home" size={36} color={colors.textMuted} />
            </View>
          )}
          {property.isFeatured ? (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={styles.featuredText}>{t("properties.featured")}</Text>
            </View>
          ) : null}
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{typeLabel(property)}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.rowBetween}>
            <View style={styles.wilayaRow}>
              <Ionicons name="location" size={14} color={colors.textSecondary} />
              <Text style={styles.wilaya}>{property.wilaya}</Text>
            </View>
            <Text style={styles.price}>{formatPrice(property.price)}</Text>
          </View>

          {property.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {property.description}
            </Text>
          ) : null}

          <View style={styles.footerRow}>
            <View style={styles.statusPill(property.status === "available")}>
              <Text style={styles.statusText(property.status === "available")}>
                {property.status === "available" ? t("properties.available") : t("properties.rented")}
              </Text>
            </View>
          </View>
        </View>
      </AnimatedPressable>

      <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite} activeOpacity={0.8}>
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={20}
          color={isFavorite ? colors.danger : "#fff"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: "hidden" as const,
    position: "relative" as const,
    ...shadow.card,
  },
  imageWrapper: {
    width: "100%" as const,
    height: 180,
    position: "relative" as const,
    backgroundColor: colors.border,
  },
  image: {
    width: "100%" as const,
    height: "100%" as const,
  },
  imagePlaceholder: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  featuredBadge: {
    position: "absolute" as const,
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  featuredText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700" as const,
  },
  typeBadge: {
    position: "absolute" as const,
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.overlay,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  typeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700" as const,
  },
  favoriteButton: {
    position: "absolute" as const,
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.overlay,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 10,
  },
  body: {
    padding: spacing.md,
  },
  rowBetween: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: spacing.xs,
  },
  wilayaRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  wilaya: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  price: {
    ...typography.price,
    color: colors.primary,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: "row" as const,
  },
  statusPill: (available: boolean) => ({
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: available ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)",
  }),
  statusText: (available: boolean) => ({
    fontSize: 12,
    fontWeight: "600" as const,
    color: available ? colors.success : colors.danger,
  }),
};