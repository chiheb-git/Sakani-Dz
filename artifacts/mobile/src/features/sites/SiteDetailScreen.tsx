import { useRoute, useNavigation } from "@react-navigation/native";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography } from "../../shared/theme/theme";
import SkeletonCard from "../../shared/components/SkeletonCard";
import { useGetSiteQuery, useListSitePropertiesQuery } from "../../core/api/apiSlice";
import PropertyCard from "../properties/components/PropertyCard";

export default function SiteDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { siteId } = route.params;

  const { data: site, isLoading: siteLoading } = useGetSiteQuery(siteId);
  const { data: propsData, isLoading: propsLoading } = useListSitePropertiesQuery(siteId);

  const properties = propsData?.data ?? [];
  const screenWidth = Dimensions.get("window").width;

  if (siteLoading || !site) {
    return (
      <View style={styles.loading}><SkeletonCard /></View>
    );
  }

  const photo = site.photos?.[0];

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <>
            <View style={styles.imageWrapper}>
              {photo ? (
                <Image source={{ uri: photo }} style={[styles.image, { width: screenWidth }]} />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder, { width: screenWidth }]}>
                  <Ionicons name="business" size={48} color={colors.textMuted} />
                </View>
              )}
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.name}>{site.name}</Text>
              <View style={styles.wilayaRow}>
                <Ionicons name="location" size={16} color={colors.textSecondary} />
                <Text style={styles.wilaya}>{site.wilaya}</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {site.propertyCount ?? 0} logement{(site.propertyCount ?? 0) > 1 ? "s" : ""}
                  </Text>
                </View>
              </View>

              {site.description ? <Text style={styles.description}>{site.description}</Text> : null}

              <Text style={styles.sectionTitle}>Logements disponibles</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          propsLoading ? (
            <View style={styles.centerFillInline}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.centerFillInline}>
              <Text style={styles.emptyText}>Aucun logement dans ce site pour le moment</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => navigation.navigate("PropertyDetail", { propertyId: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: "center", backgroundColor: colors.background },
  centerFillInline: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xl },
  imageWrapper: { height: 240, backgroundColor: colors.border, position: "relative" },
  image: { height: "100%" },
  imagePlaceholder: { height: "100%", alignItems: "center", justifyContent: "center" },
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
  content: { padding: spacing.lg },
  name: { ...typography.h2, color: colors.textPrimary },
  wilayaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.xs },
  wilaya: { ...typography.bodyMedium, color: colors.textSecondary, flex: 1 },
  countBadge: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  countText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  description: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md, lineHeight: 22 },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  emptyText: { ...typography.body, color: colors.textMuted },
});