import { useState, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, typography } from "../../shared/theme/theme";
import { useListTouristSpotsQuery } from "../../core/api/apiSlice";
import TouristSpotCard from "./components/TouristSpotCard";
import WilayaPicker from "../../shared/components/WilayaPicker";
import type { TouristSpot } from "@workspace/api-zod";

export default function TourismScreen() {
  const navigation = useNavigation<any>();
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);

  const queryArgs = useMemo(
    () => ({ wilaya: selectedWilaya ?? undefined, limit: 20 }),
    [selectedWilaya],
  );

  const { data, isLoading, isFetching, refetch } = useListTouristSpotsQuery(queryArgs);
  const spots: TouristSpot[] = data?.data ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tourisme</Text>
        <Text style={styles.headerSubtitle}>Lieux touristiques à découvrir en Algérie</Text>
      </View>

      <WilayaPicker selectedWilaya={selectedWilaya} onSelectWilaya={setSelectedWilaya} />

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : spots.length === 0 ? (
        <View style={styles.centerFill}>
          <Ionicons name="map" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>Aucun lieu touristique trouvé pour ces critères</Text>
        </View>
      ) : (
        <FlatList
          data={spots}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xl }}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <TouristSpotCard
              spot={item}
              onPress={() => navigation.navigate("TouristSpotDetail", { spotId: item.id })}
            />
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