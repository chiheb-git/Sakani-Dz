import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing, typography, shadow } from "../../shared/theme/theme";
import VideoBackgroundHeader from "../../shared/components/VideoBackgroundHeader";

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <VideoBackgroundHeader>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("privacy.title")}</Text>
        </View>
      </VideoBackgroundHeader>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.text}>{t("privacy.content")}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTitle: { ...typography.h1, color: "#fff" },
  content: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadow.card,
  },
  text: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
});