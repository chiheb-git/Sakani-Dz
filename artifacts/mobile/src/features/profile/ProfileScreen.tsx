import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { colors, spacing, radius, typography, shadow } from "../../shared/theme/theme";
import type { RootState } from "../../core/store";
import VideoBackgroundHeader from "../../shared/components/VideoBackgroundHeader";
import FadeIn from "../../shared/components/FadeIn";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const authRole = useSelector((state: RootState) => state.auth.role);
  const vendorId = useSelector((state: RootState) => state.auth.vendorId);

  return (
    <View style={styles.container}>
      <VideoBackgroundHeader>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("profile.title")}</Text>
        <Text style={styles.headerSubtitle}>{t("profile.subtitle")}</Text>
      </View>
      </VideoBackgroundHeader>

      <ScrollView contentContainerStyle={styles.content}>
        <FadeIn delay={40}><TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate("LanguageSelection")}>
          <View style={styles.cardIcon}>
            <Ionicons name="language" size={24} color={colors.primary} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{t("profile.language")}</Text>
            <Text style={styles.cardSubtitle}>{t("profile.languageSubtitle")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity></FadeIn>

        <FadeIn delay={100}><TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate("PrivacyPolicy")}>
          <View style={styles.cardIcon}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{t("profile.privacy")}</Text>
            <Text style={styles.cardSubtitle}>{t("profile.privacySubtitle")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity></FadeIn>

        {authRole === "vendor" && vendorId ? (
          <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate("VendorDashboard")}>
            <View style={styles.cardIcon}>
              <Ionicons name="storefront" size={24} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{t("profile.myVendorSpace")}</Text>
              <Text style={styles.cardSubtitle}>{t("profile.myVendorSpaceSubtitle")}</Text>
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
                <Text style={styles.cardTitle}>{t("profile.becomeVendor")}</Text>
                <Text style={styles.cardSubtitle}>{t("profile.becomeVendorSubtitle")}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate("VendorLogin")}>
              <View style={styles.cardIcon}>
                <Ionicons name="log-in" size={24} color={colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{t("profile.alreadyVendor")}</Text>
                <Text style={styles.cardSubtitle}>{t("profile.alreadyVendorSubtitle")}</Text>
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
            <Text style={styles.cardTitle}>{t("profile.about")}</Text>
            <Text style={styles.cardSubtitle}>{t("profile.aboutSubtitle")}</Text>
          </View>
        </View>
      </ScrollView>
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