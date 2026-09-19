import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, typography, shadow } from "../../shared/theme/theme";
import { useVendorForgotPasswordMutation } from "../../core/api/apiSlice";
import VideoBackgroundHeader from "../../shared/components/VideoBackgroundHeader";
import AnimatedPressable from "../../shared/components/AnimatedPressable";

export default function VendorForgotPasswordScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [forgotPassword, { isLoading }] = useVendorForgotPasswordMutation();
  const [code, setCode] = useState("");

  const handleSubmit = async () => {
    if (!code.trim()) {
      Alert.alert(t("vendor.error"), t("vendor.missingCode"));
      return;
    }
    try {
      await forgotPassword({ code: code.trim() }).unwrap();
      Alert.alert(
        t("vendor.submitSuccessTitle"),
        t("vendor.forgotSuccess"),
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert(t("vendor.error"), t("vendor.codeNotFound"));
    }
  };

  return (
    <View style={styles.container}>
      <VideoBackgroundHeader>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("vendor.forgotTitle")}</Text>
        <Text style={styles.headerSubtitle}>{t("vendor.forgotSubtitle")}</Text>
      </View>
      </VideoBackgroundHeader>

      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder={t("vendor.codePlaceholder")}
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          placeholderTextColor={colors.textMuted}
        />
        <AnimatedPressable style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{t("vendor.forgotSubmit")}</Text>}
        </AnimatedPressable>
      </View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  headerTitle: { ...typography.h1, color: "#fff" },
  headerSubtitle: { ...typography.body, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  content: { padding: spacing.lg },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
    ...shadow.card,
  },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});