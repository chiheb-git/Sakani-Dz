import { useRoute, useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, Dimensions, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, shadow } from "../../shared/theme/theme";
import SkeletonCard from "../../shared/components/SkeletonCard";
import { useGetTouristSpotQuery } from "../../core/api/apiSlice";
import { useRecordHistory } from "../../shared/hooks/useRecordHistory";

export default function TouristSpotDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { spotId } = route.params;

  const { data: spot, isLoading } = useGetTouristSpotQuery(spotId);
  useRecordHistory({ touristSpotId: spotId });
  const screenWidth = Dimensions.get("window").width;
  const [imageFailed, setImageFailed] = useState(false);

  if (isLoading || !spot) {
    return (
      <View style={styles.loading}><SkeletonCard /></View>
    );
  }

  const photo = spot.photos?.[0];
  const imageUri = photo && !imageFailed ? photo : null;

  const handleMap = () => {
    if (spot.latitude != null && spot.longitude != null) {
      const url = `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`;
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView bounces={false}>
        <View style={styles.imageWrapper}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={[styles.image, { width: screenWidth }]}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder, { width: screenWidth }]}>
              <Ionicons name="map" size={48} color={colors.textMuted} />
              <Text style={styles.imagePlaceholderText}>Photo non disponible</Text>
            </View>
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{spot.name}</Text>
          <View style={styles.wilayaRow}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <Text style={styles.wilaya}>{spot.wilaya}</Text>
          </View>

          {spot.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{spot.description}</Text>
            </View>
          ) : null}

          {spot.latitude != null && spot.longitude != null ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Localisation</Text>
              <TouchableOpacity style={styles.mapCard} onPress={handleMap} activeOpacity={0.85}>
                <Ionicons name="map" size={28} color={colors.primary} />
                <Text style={styles.mapCardText}>Voir sur la carte</Text>
                <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: "center", backgroundColor: colors.background },
  imageWrapper: { height: 280, backgroundColor: colors.border, position: "relative" },
  image: { height: "100%" },
  imagePlaceholder: { height: "100%", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  imagePlaceholderText: { ...typography.bodyMedium, color: colors.textMuted },
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
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  name: { ...typography.h2, color: colors.textPrimary },
  wilayaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.xs },
  wilaya: { ...typography.bodyMedium, color: colors.textSecondary },
  section: { marginTop: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  mapCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.card,
  },
  mapCardText: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1 },
});