import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { colors, spacing, radius, typography, shadow } from "../../shared/theme/theme";
import type { RootState } from "../../core/store";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const authRole = useSelector((state: RootState) => state.auth.role);
  const vendorId = useSelector((state: RootState) => state.auth.vendorId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <Text style={styles.headerSubtitle}>Paramètres et compte</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {authRole === "vendor" && vendorId ? (
          <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate("VendorDashboard")}>
            <View style={styles.cardIcon}>
              <Ionicons name="storefront" size={24} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Mon espace vendeur</Text>
              <Text style={styles.cardSubtitle}>Gérer mes biens et mon abonnement</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate("VendorRegister")}>
              <View style={styles.cardIcon}>
                <Ionicons name="storefront" size={24} color={colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>Devenir vendeur</Text>
                <Text style={styles.cardSubtitle}>Publiez vos biens sur Sakani Dz</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate("VendorLogin")}>
              <View style={styles.cardIcon}>
                <Ionicons name="log-in" size={24} color={colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>Déjà vendeur ?</Text>
                <Text style={styles.cardSubtitle}>Connectez-vous avec votre code</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </>
        )}

        <View style={styles.card}>
          <View style={styles.cardIcon}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>À propos</Text>
            <Text style={styles.cardSubtitle}>Sakani Dz — Immobilier & Tourisme en Algérie</Text>
          </View>
        </View>
      </ScrollView>
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
  content: { padding: spacing.lg },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: "rgba(15,42,67,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1 },
  cardTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  cardSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});