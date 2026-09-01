import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

type PropertyType = "apartment" | "villa" | "site";
const APARTMENT_TYPES = ["F1", "F2", "F3", "F4", "F5"] as const;

export default function VendorRegisterScreen() {
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
        Alert.alert("Permission refusée", "L'accès à la position est nécessaire pour cette fonctionnalité.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch {
      Alert.alert("Erreur", "Impossible de récupérer la position actuelle.");
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim() || !wilaya) {
      Alert.alert("Champs manquants", "Merci de remplir tous les champs obligatoires.");
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
        "Demande envoyée",
        "Votre inscription a été soumise. Un administrateur va l'examiner et vous recevrez un code d'accès par la suite.",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert("Erreur", "Impossible d'envoyer votre demande. Réessayez plus tard.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Devenir vendeur</Text>
        <Text style={styles.headerSubtitle}>Rejoignez Sakani Dz et publiez vos annonces</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        <TextInput style={styles.input} placeholder="Prénom *" value={firstName} onChangeText={setFirstName} placeholderTextColor={colors.textMuted} />
        <TextInput style={styles.input} placeholder="Nom *" value={lastName} onChangeText={setLastName} placeholderTextColor={colors.textMuted} />
        <TextInput style={styles.input} placeholder="Adresse" value={address} onChangeText={setAddress} placeholderTextColor={colors.textMuted} />
        <TextInput style={styles.input} placeholder="Téléphone *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={colors.textMuted} />
        <TextInput style={styles.input} placeholder="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textMuted} />

        <Text style={styles.sectionTitle}>Type de bien</Text>
        <View style={styles.typeRow}>
          {(["apartment", "villa", "site"] as PropertyType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, propertyType === t && styles.typeChipActive]}
              onPress={() => setPropertyType(t)}
            >
              <Text style={[styles.typeChipText, propertyType === t && styles.typeChipTextActive]}>
                {t === "apartment" ? "Appartement" : t === "villa" ? "Villa" : "Site"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {propertyType === "apartment" ? (
          <>
            <Text style={styles.label}>Type d'appartement</Text>
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

        <Text style={styles.sectionTitle}>Localisation</Text>
        <Text style={styles.label}>Wilaya *</Text>
        <WilayaPicker selectedWilaya={wilaya} onSelectWilaya={setWilaya} />

        <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation} activeOpacity={0.85}>
          {locating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="locate" size={20} color={colors.primary} />
          )}
          <Text style={styles.locationButtonText}>
            {location ? "Position enregistrée ✓" : "Utiliser ma position actuelle"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Détails</Text>
        <TextInput
          style={styles.input}
          placeholder="Prix (DA)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholderTextColor={colors.textMuted}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.85}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Envoyer ma demande</Text>}
        </TouchableOpacity>
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
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
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
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.sm },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { ...typography.caption, fontWeight: "600", color: colors.textSecondary },
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