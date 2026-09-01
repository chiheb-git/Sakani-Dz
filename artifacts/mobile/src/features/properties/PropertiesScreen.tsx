import { useState, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, typography, shadow } from "../../shared/theme/theme";
import { useListPropertiesQuery } from "../../core/api/apiSlice";
import PropertyCard from "./components/PropertyCard";
import WilayaPicker from "../../shared/components/WilayaPicker";
import type { Property } from "@workspace/api-zod";

export default function PropertiesScreen() {
  const navigation = useNavigation<any>();
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"all" | "apartment" | "villa">("all");

  const queryArgs = useMemo(
    () => ({
      wilaya: selectedWilaya ?? undefined,
      type: selectedType === "all" ? undefined : selectedType,
      limit: 20,
    }),
    [selectedWilaya, selectedType],
  );

  const { data, isLoading, isFetching, refetch } = useListPropertiesQuery(queryArgs);
  const properties: Property[] = data?.data ?? [];

  const tabs: { key: "all" | "apartment" | "villa"; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "all", label: "Tous", icon: "grid" },
    { key: "apartment", label: "Appartements", icon: "home" },
    { key: "villa", label: "Villas", icon: "business" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sakani Dz</Text>
        <Text style={styles.headerSubtitle}>Trouvez votre logement idéal en Algérie</Text>
      </View>

      <View style={styles.typeTabs}>
        {tabs.map((tab) => {
          const active = selectedType === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.typeTab, active && styles.typeTabActive]}
              onPress={() => setSelectedType(tab.key)}
              activeOpacity={0.8}
            >
              <Ionicons name={tab.icon} size={16} color={active ? "#fff" : colors.textSecondary} />
              <Text style={[styles.typeTabText, active && styles.typeTabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <WilayaPicker selectedWilaya={selectedWilaya} onSelectWilaya={setSelectedWilaya} />

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : properties.length === 0 ? (
        <View style={styles.centerFill}>
          <Ionicons name="search" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>Aucun bien trouvé pour ces critères</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xl }}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => navigation.navigate("PropertyDetail", { propertyId: item.id })}
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
  typeTabs: { flexDirection: "row", paddingHorizontal: spacing.md, marginTop: spacing.md, gap: spacing.sm },
  typeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  typeTabActive: { backgroundColor: colors.primary },
  typeTabText: { ...typography.caption, fontWeight: "600", color: colors.textSecondary },
  typeTabTextActive: { color: "#fff" },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  emptyText: { ...typography.body, color: colors.textMuted },
});