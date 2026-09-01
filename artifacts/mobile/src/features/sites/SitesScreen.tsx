import { useState, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, typography } from "../../shared/theme/theme";
import { useListSitesQuery } from "../../core/api/apiSlice";
import SiteCard from "./components/SiteCard";
import WilayaPicker from "../../shared/components/WilayaPicker";
import type { Site } from "@workspace/api-zod";

export default function SitesScreen() {
  const navigation = useNavigation<any>();
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);

  const queryArgs = useMemo(
    () => ({ wilaya: selectedWilaya ?? undefined, limit: 20 }),
    [selectedWilaya],
  );

  const { data, isLoading, isFetching, refetch } = useListSitesQuery(queryArgs);
  const sites: Site[] = data?.data ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sites</Text>
        <Text style={styles.headerSubtitle}>Résidences et lotissements en Algérie</Text>
      </View>

      <WilayaPicker selectedWilaya={selectedWilaya} onSelectWilaya={setSelectedWilaya} />

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : sites.length === 0 ? (
        <View style={styles.centerFill}>
          <Ionicons name="business" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>Aucun site trouvé pour ces critères</Text>
        </View>
      ) : (
        <FlatList
          data={sites}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xl }}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <SiteCard site={item} onPress={() => navigation.navigate("SiteDetail", { siteId: item.id })} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTitle: { ...typography.h1, color: "#fff" },
  headerSubtitle: { ...typography.body, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  emptyText: { ...typography.body, color: colors.textMuted },
});