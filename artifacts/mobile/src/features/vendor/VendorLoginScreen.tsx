import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { colors, spacing, radius, typography, shadow } from "../../shared/theme/theme";
import { useLoginVendorMutation, useRegisterVendorPushTokenMutation } from "../../core/api/apiSlice";
import { vendorLoggedIn } from "../auth/authSlice";
import { saveAuthToken } from "../../core/api/axiosInstance";
import { getExpoPushToken } from "../../core/notifications";
import VideoBackgroundHeader from "../../shared/components/VideoBackgroundHeader";
import AnimatedPressable from "../../shared/components/AnimatedPressable";
import FadeIn from "../../shared/components/FadeIn";

export default function VendorLoginScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [loginVendor, { isLoading }] = useLoginVendorMutation();
  const [registerPushToken] = useRegisterVendorPushTokenMutation();

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!code.trim() || !password.trim()) {
      Alert.alert(t("vendor.error"), t("vendor.missingFields"));
      return;
    }
    try {
      const result = await loginVendor({ code: code.trim(), password }).unwrap();
      await saveAuthToken(result.accessToken);
      dispatch(vendorLoggedIn({ vendorId: result.userId, token: result.accessToken }));
      const pushToken = await getExpoPushToken();
      if (pushToken) await registerPushToken({ token: pushToken });
      navigation.navigate("VendorDashboard");
    } catch {
      Alert.alert(t("vendor.error"), t("vendor.invalidCredentials"));
    }
  };

  return (
    <View style={styles.container}>
      <VideoBackgroundHeader>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("vendor.login")}</Text>
        <Text style={styles.headerSubtitle}>{t("vendor.loginSubtitle")}</Text>
      </View>
      </VideoBackgroundHeader>

      <FadeIn style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder={t("vendor.codePlaceholder")}
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          placeholderTextColor={colors.textMuted}
        />
        <TextInput
          style={styles.input}
          placeholder={t("vendor.passwordPlaceholder")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={colors.textMuted}
        />

        <AnimatedPressable style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{t("vendor.loginButton")}</Text>}
        </AnimatedPressable>

        <TouchableOpacity style={styles.forgotButton} onPress={() => navigation.navigate("VendorForgotPassword")}>
          <Text style={styles.forgotButtonText}>{t("vendor.forgotPassword")}</Text>
        </TouchableOpacity>
      </FadeIn>
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
  forgotButton: { alignItems: "center", marginTop: spacing.md },
  forgotButtonText: { ...typography.caption, color: colors.primary, fontWeight: "600" },
});