import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { colors, spacing, radius, typography, shadow } from "../../shared/theme/theme";
import { useLoginVendorMutation } from "../../core/api/apiSlice";
import { vendorLoggedIn } from "../auth/authSlice";
import { saveAuthToken } from "../../core/api/axiosInstance";

export default function VendorLoginScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [loginVendor, { isLoading }] = useLoginVendorMutation();

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!code.trim() || !password.trim()) {
      Alert.alert("Champs manquants", "Merci de saisir votre code et votre mot de passe.");
      return;
    }
    try {
      const result = await loginVendor({ code: code.trim(), password }).unwrap();
      await saveAuthToken(result.accessToken);
      dispatch(vendorLoggedIn({ vendorId: result.userId, token: result.accessToken }));
      navigation.navigate("VendorDashboard");
    } catch {
      Alert.alert("Erreur", "Code ou mot de passe incorrect.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connexion vendeur</Text>
        <Text style={styles.headerSubtitle}>Accédez à votre espace vendeur</Text>
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Code vendeur"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          placeholderTextColor={colors.textMuted}
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.85}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Se connecter</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotButton} onPress={() => navigation.navigate("VendorForgotPassword")}>
          <Text style={styles.forgotButtonText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>
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