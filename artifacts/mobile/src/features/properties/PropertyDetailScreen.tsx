import { useRoute, useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../../shared/theme/theme";
import { useGetPropertyQuery, useListFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from "../../core/api/apiSlice";
import { useRecordHistory } from "../../shared/hooks/useRecordHistory";

function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(price)} DA`;
}

export default function PropertyDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { propertyId } = route.params;

  const { data: property, isLoading } = useGetPropertyQuery(propertyId);
  useRecordHistory({ propertyId });

  const { data: favoritesData } = useListFavoritesQuery();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const isFavorite = favoritesData?.data.some((f) => f.propertyId === propertyId) ?? false;

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(propertyId);
    } else {
      addFavorite({ propertyId });
    }
  };

  if (isLoading || !property) {
    return (
      <View style={styles.centerFill}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const vendor = property.vendor;
  const photo = property.photos?.[0];
  const screenWidth = Dimensions.get("window").width;

  const handleCall = () => {
    if (vendor?.phone) Linking.openURL(`tel:${vendor.phone}`);
  };

  const handleWhatsApp = () => {
    if (vendor?.phone) {
      const cleaned = vendor.phone.replace(/[^0-9]/g, "");
      Linking.openURL(`https://wa.me/${cleaned}`);
    }
  };

  const handleMap = () => {
    if (property.latitude != null && property.longitude != null) {
      const url = `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`;
      Linking.openURL(url);
    }
  };

  const typeLabel =
    property.type === "apartment" && property.apartmentType ? property.apartmentType : "Villa";

  return (
    <View style={styles.container}>
      <ScrollView bounces={false}>
        <View style={styles.imageWrapper}>
          {photo ? (
            <Image source={{ uri: photo }} style={[styles.image, { width: screenWidth }]} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder, { width: screenWidth }]}>
              <Ionicons name="home" size={48} color={colors.textMuted} />
            </View>
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite} activeOpacity={0.8}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? colors.danger : "#fff"} />
          </TouchableOpacity>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.rowBetween}>
            <View style={styles.wilayaRow}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text style={styles.wilaya}>{property.wilaya}</Text>
            </View>
            <Text style={styles.price}>{formatPrice(property.price)}</Text>
          </View>

          <View style={[styles.statusPill, property.status !== "available" && styles.statusPillRented]}>
            <Text style={styles.statusText}>
              {property.status === "available" ? "Disponible" : "Loué"}
            </Text>
          </View>

          {property.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{property.description}</Text>
            </View>
          ) : null}

          {property.equipment && property.equipment.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Équipements</Text>
              <View style={styles.equipmentGrid}>
                {property.equipment.map((item, index) => (
                  <View key={index} style={styles.equipmentChip}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={styles.equipmentText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {property.latitude != null && property.longitude != null ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Localisation</Text>
              <TouchableOpacity style={styles.mapCard} onPress={handleMap} activeOpacity={0.85}>
                <Ionicons name="map" size={28} color={colors.primary} />
                <Text style={styles.mapCardText}>Voir sur la carte</Text>
                <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : null}

          {vendor ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vendeur</Text>
              <View style={styles.vendorCard}>
                <View style={styles.vendorAvatar}>
                  <Ionicons name="person" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vendorName}>
                    {vendor.firstName} {vendor.lastName}
                  </Text>
                  {vendor.isVerified ? (
                    <View style={styles.verifiedRow}>
                      <Ionicons name="checkmark-circle" size={13} color={colors.success} />
                      <Text style={styles.verifiedText}>Vendeur vérifié</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {vendor ? (
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.footerButton, styles.callButton]} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.footerButtonText}>Appeler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.footerButton, styles.whatsappButton]} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.footerButtonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  imageWrapper: {
    height: 280,
    backgroundColor: colors.border,
    position: "relative",
  },
  image: {
    height: "100%",
  },
  imagePlaceholder: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: spacing.xxl,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: spacing.xxl,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadge: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  typeBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wilayaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  wilaya: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  price: {
    ...typography.h2,
    color: colors.primary,
  },
  statusPill: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    backgroundColor: "rgba(22,163,74,0.1)",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  statusPillRented: {
    backgroundColor: "rgba(220,38,38,0.1)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.success,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  equipmentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  equipmentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  equipmentText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  mapCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.card,
  },
  mapCardText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  vendorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.card,
  },
  vendorAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: "rgba(15,42,67,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  vendorName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    ...typography.caption,
    color: colors.success,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  callButton: {
    backgroundColor: colors.primary,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  footerButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});