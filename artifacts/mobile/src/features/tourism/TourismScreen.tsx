import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, typography } from "../../shared/theme/theme";
import { useListTouristSpotsQuery } from "../../core/api/apiSlice";
import TouristSpotCard from "./components/TouristSpotCard";
import WilayaPicker from "../../shared/components/WilayaPicker";
import type { TouristSpot } from "@workspace/api-zod";
import VideoBackgroundHeader from "../../shared/components/VideoBackgroundHeader";
import FadeIn from "../../shared/components/FadeIn";
import SkeletonCard from "../../shared/components/SkeletonCard";

export default function TourismScreen() {
  const { t } = useTranslation();
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
      <VideoBackgroundHeader>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("tourism.title")}</Text>
          <Text style={styles.headerSubtitle}>{t("app.tourismSubtitle")}</Text>
        </View>
      </VideoBackgroundHeader>

      <WilayaPicker selectedWilaya={selectedWilaya} onSelectWilaya={setSelectedWilaya} />

      {isLoading ? (
        <FlatList data={[1, 2, 3]} keyExtractor={(item) => String(item)} contentContainerStyle={{ paddingTop: spacing.md }} renderItem={() => <SkeletonCard />} />
      ) : spots.length === 0 ? (
        <View style={styles.centerFill}>
          <Ionicons name="map" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>{t("tourism.empty")}</Text>
        </View>
      ) : (
        <FlatList
          data={spots}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xl }}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item, index }) => (
            <FadeIn delay={index * 70}>
              <TouristSpotCard spot={item} onPress={() => navigation.navigate("TouristSpotDetail", { spotId: item.id })} />
            </FadeIn>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: "transparent",
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