import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { colors, spacing, radius, typography, shadow } from "../../shared/theme/theme";
import { loggedOut } from "../auth/authSlice";
import { clearAuthToken } from "../../core/api/axiosInstance";
import { useGetVendorProfileQuery, useGetVendorStatsQuery, useListVendorPropertiesQuery } from "../../core/api/apiSlice";
import PropertyCard from "../properties/components/PropertyCard";
import VideoBackgroundHeader from "../../shared/components/VideoBackgroundHeader";
import FadeIn from "../../shared/components/FadeIn";
import SkeletonCard from "../../shared/components/SkeletonCard";

function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente d'approbation", color: colors.textMuted },
  active: { label: "Actif", color: colors.success },
  renewal_required: { label: "Renouvellement requis", color: colors.accent },
  blocked: { label: "Bloqué", color: colors.danger },
  rejected: { label: "Rejeté", color: colors.danger },
};

export default function VendorDashboardScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const { data: vendor, isLoading: vendorLoading } = useGetVendorProfileQuery();
  const { data: stats, isLoading: statsLoading } = useGetVendorStatsQuery();
  const { data: propertiesData, isLoading: propertiesLoading } = useListVendorPropertiesQuery();
  const properties = propertiesData?.data ?? [];

  const handleLogout = async () => {
    await clearAuthToken();
    dispatch(loggedOut());
    navigation.navigate("Profile", { screen: "ProfileHome" });
  };

  if (vendorLoading || !vendor) {
    return (
      <View style={styles.loading}><SkeletonCard /></View>
    );
  }

  const statusInfo = STATUS_LABELS[vendor.status] ?? { label: vendor.status, color: colors.textMuted };

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <>
            <VideoBackgroundHeader>
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>
                  {vendor.firstName} {vendor.lastName}
                </Text>
                <TouchableOpacity onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.headerSubtitle}>Code vendeur : {vendor.code ?? "—"}</Text>
            </View>
            </VideoBackgroundHeader>

            <View style={styles.content}>
              <View style={styles.statusCard}>
                <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusLabel}>{statusInfo.label}</Text>
                  {vendor.subscriptionExpiresAt ? (
                    <Text style={styles.statusSubtext}>
                      Abonnement jusqu'au {formatDate(vendor.subscriptionExpiresAt)}
                    </Text>
                  ) : null}
                </View>
              </View>

              {statsLoading ? (
                <FadeIn><View style={styles.statsLoading}><SkeletonCard /></View></FadeIn>
              ) : stats ? (
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.totalProperties}</Text>
                    <Text style={styles.statLabel}>Biens</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.totalViews}</Text>
                    <Text style={styles.statLabel}>Vues</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.availableProperties}</Text>
                    <Text style={styles.statLabel}>Disponibles</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.totalSites}</Text>
                    <Text style={styles.statLabel}>Sites</Text>
                  </View>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("VendorPropertyForm")}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Ajouter un bien</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Mes biens ({properties.length})</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          propertiesLoading ? (
            <View style={styles.statsLoading}><SkeletonCard /></View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="home" size={36} color={colors.textMuted} />
              <Text style={styles.emptyText}>Aucun bien publié pour le moment</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => navigation.navigate("VendorPropertyForm", { propertyId: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: "center", paddingTop: spacing.xl, backgroundColor: colors.background },
  statsLoading: { marginBottom: spacing.md },
  header: {
    backgroundColor: "transparent",
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { ...typography.h1, color: "#fff" },
  headerSubtitle: { ...typography.body, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  content: { padding: spacing.lg },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { ...typography.bodyMedium, color: colors.textPrimary },
  statusSubtext: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  statBox: {
    flexBasis: "47%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    ...shadow.card,
  },
  statValue: { ...typography.h2, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xl, gap: spacing.sm },
  emptyText: { ...typography.body, color: colors.textMuted },
});