import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { colors, spacing, radius, typography, shadow } from "../../shared/theme/theme";
import { useRegisterVendorMutation } from "../../core/api/apiSlice";
import WilayaPicker from "../../shared/components/WilayaPicker";
import VideoBackgroundHeader from "../../shared/components/VideoBackgroundHeader";
import AnimatedPressable from "../../shared/components/AnimatedPressable";
import FadeIn from "../../shared/components/FadeIn";

type PropertyType = "apartment" | "villa" | "site";
const APARTMENT_TYPES = ["F1", "F2", "F3", "F4", "F5"] as const;

export default function VendorRegisterScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [registerVendor, { isLoading }] = useRegisterVendorMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [apartmentType, setApartmentType] = useState<(typeof APARTMENT_TYPES)[number]>("F2");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [wilaya, setWilaya] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const handleGetLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("vendor.permissionDenied"), t("vendor.locationPermission"));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch {
      Alert.alert(t("vendor.error"), t("vendor.locationError"));
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim() || !wilaya) {
      Alert.alert(t("vendor.error"), t("vendor.missingFields"));
      return;
    }
    try {
      await registerVendor({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: address.trim() || undefined,
        phone: phone.trim(),
        email: email.trim(),
        propertyType,
        apartmentType: propertyType === "apartment" ? apartmentType : undefined,
        price: price ? Number(price) : undefined,
        description: description.trim() || undefined,
        wilaya,
        latitude: location?.latitude,
        longitude: location?.longitude,
      }).unwrap();

      Alert.alert(
        t("vendor.submitSuccessTitle"),
        t("vendor.registerSuccess"),
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert(t("vendor.error"), t("vendor.submitError"));
    }
  };

  return (
    <View style={styles.container}>
      <VideoBackgroundHeader>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("vendor.register")}</Text>
        <Text style={styles.headerSubtitle}>{t("vendor.registerSubtitle")}</Text>
      </View>
      </VideoBackgroundHeader>

      <FadeIn><KeyboardAvoidingView
        style={styles.formWrapper}
        behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}
      >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>{t("vendor.personalInfo")}</Text>
        <TextInput style={styles.input} placeholder={t("vendor.firstName")} value={firstName} onChangeText={setFirstName} placeholderTextColor={colors.textMuted} />
        <TextInput style={styles.input} placeholder={t("vendor.lastName")} value={lastName} onChangeText={setLastName} placeholderTextColor={colors.textMuted} />
        <TextInput style={styles.input} placeholder={t("vendor.address")} value={address} onChangeText={setAddress} placeholderTextColor={colors.textMuted} />
        <TextInput style={styles.input} placeholder={t("vendor.phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={colors.textMuted} />
        <TextInput style={styles.input} placeholder={t("vendor.email")} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textMuted} />

        <Text style={styles.sectionTitle}>{t("vendor.propertyType")}</Text>
        <View style={styles.typeRow}>
          {(["apartment", "villa", "site"] as PropertyType[]).map((propertyTypeOption) => (
            <TouchableOpacity
              key={propertyTypeOption}
              style={[styles.typeChip, propertyType === propertyTypeOption && styles.typeChipActive]}
              onPress={() => setPropertyType(propertyTypeOption)}
            >
              <Text style={[styles.typeChipText, propertyType === propertyTypeOption && styles.typeChipTextActive]}>
                {propertyTypeOption === "apartment" ? t("vendor.apartment") : propertyTypeOption === "villa" ? t("vendor.villa") : t("vendor.site")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {propertyType === "apartment" ? (
          <>
            <Text style={styles.label}>{t("vendor.apartmentType")}</Text>
            <View style={styles.typeRow}>
              {APARTMENT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, apartmentType === t && styles.typeChipActive]}
                  onPress={() => setApartmentType(t)}
                >
                  <Text style={[styles.typeChipText, apartmentType === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>{t("vendor.location")}</Text>
        <Text style={styles.label}>{t("vendor.wilayaRequired")}</Text>
        <WilayaPicker selectedWilaya={wilaya} onSelectWilaya={setWilaya} />

        <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation} activeOpacity={0.85}>
          {locating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="locate" size={20} color={colors.primary} />
          )}
          <Text style={styles.locationButtonText}>
            {location ? `${t("vendor.savedLocation")} ✓` : t("vendor.useLocation")}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{t("vendor.details")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("vendor.price")}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholderTextColor={colors.textMuted}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t("vendor.description")}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor={colors.textMuted}
        />

        <AnimatedPressable style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{t("vendor.submit")}</Text>}
        </AnimatedPressable>
      </ScrollView>
      </KeyboardAvoidingView>
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  formWrapper: { flex: 1 },
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
  content: { padding: spacing.lg, paddingBottom: 160 },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  label: { ...typography.caption, fontWeight: "600", color: colors.textSecondary, marginBottom: spacing.xs },
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
  textArea: { height: 90, textAlignVertical: "top" },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeChip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { ...typography.caption, flexShrink: 0, fontWeight: "600", color: colors.textSecondary },
  typeChipTextActive: { color: "#fff" },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  locationButtonText: { ...typography.bodyMedium, color: colors.textPrimary },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
    ...shadow.card,
  },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});