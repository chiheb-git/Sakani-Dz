import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, SectionList, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, typography, shadow } from "../../shared/theme/theme";
import { useListHistoryQuery, useRemoveHistoryEntryMutation } from "../../core/api/apiSlice";
import type { HistoryEntry } from "../../core/api/apiSlice";
import VideoBackgroundHeader from "../../shared/components/VideoBackgroundHeader";
import FadeIn from "../../shared/components/FadeIn";
import SkeletonCard from "../../shared/components/SkeletonCard";

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "common.today";
  if (isSameDay(date, yesterday)) return "common.yesterday";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(price)} DA`;
}

export default function HistoryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { data, isLoading } = useListHistoryQuery();
  const [removeHistoryEntry] = useRemoveHistoryEntryMutation();
  const entries = data?.data ?? [];

  const sections = useMemo(() => {
    const groups: Record<string, HistoryEntry[]> = {};
    for (const entry of entries) {
      const label = formatDateLabel(entry.viewedAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(entry);
    }
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [entries]);

  const handlePress = (entry: HistoryEntry) => {
    if (entry.entryType === "property" && entry.propertyId) {
      navigation.navigate("Properties", { screen: "PropertyDetail", params: { propertyId: entry.propertyId } });
    } else if (entry.entryType === "tourist_spot" && entry.touristSpotId) {
      navigation.navigate("Tourism", { screen: "TouristSpotDetail", params: { spotId: entry.touristSpotId } });
    }
  };

  return (
    <View style={styles.container}>
      <VideoBackgroundHeader>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("history.title")}</Text>
        <Text style={styles.headerSubtitle}>{t("history.subtitle")}</Text>
      </View>
      </VideoBackgroundHeader>

      {isLoading ? (
        <View style={styles.loadingList}><SkeletonCard /><SkeletonCard /></View>
      ) : entries.length === 0 ? (
        <View style={styles.centerFill}>
          <Ionicons name="time" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>{t("history.empty")}</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xl }}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title.startsWith("common.") ? t(title) : title}</Text>
          )}
          renderItem={({ item }) => {
            const isProperty = item.entryType === "property";
            const name = isProperty ? item.property?.wilaya : item.touristSpot?.name;
            const photo = isProperty ? item.property?.photos?.[0] : item.touristSpot?.photos?.[0];
            const subtitle = isProperty
              ? item.property
                ? formatPrice(item.property.price)
                : ""
              : item.touristSpot?.wilaya ?? "";

            return (
              <FadeIn delay={60}><TouchableOpacity style={styles.row} activeOpacity={0.85} onPress={() => handlePress(item)}>
                <View style={styles.imageWrapper}>
                  {photo ? (
                    <Image source={{ uri: photo }} style={styles.image} />
                  ) : (
                    <View style={[styles.image, styles.imagePlaceholder]}>
                      <Ionicons
                        name={isProperty ? "home" : "map"}
                        size={20}
                        color={colors.textMuted}
                      />
                    </View>
                  )}
                </View>
                <View style={styles.rowBody}>
                  <View style={styles.typeRow}>
                    <Ionicons
                      name={isProperty ? "home" : "map"}
                      size={12}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.typeLabel}>{isProperty ? t("history.property") : t("history.touristSpot")}</Text>
                  </View>
                  <Text style={styles.name} numberOfLines={1}>
                    {name ?? t("history.deleted")}
                  </Text>
                  {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeHistoryEntry(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity></FadeIn>
            );
          }}
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
  loadingList: { paddingTop: spacing.md },
  sectionHeader: {
    ...typography.h3,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    ...shadow.card,
  },
  imageWrapper: { width: 56, height: 56, borderRadius: radius.sm, overflow: "hidden", backgroundColor: colors.border },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  rowBody: { flex: 1 },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  typeLabel: { ...typography.caption, color: colors.textSecondary, fontSize: 11 },
  name: { ...typography.bodyMedium, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  deleteButton: { padding: spacing.xs },
});