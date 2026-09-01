import { useState, useEffect } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { colors, spacing, radius, typography, shadow } from "../../shared/theme/theme";
import {
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} from "../../core/api/apiSlice";
import WilayaPicker from "../../shared/components/WilayaPicker";

type PropertyType = "apartment" | "villa";
const APARTMENT_TYPES = ["F1", "F2", "F3", "F4", "F5"] as const;

export default function VendorPropertyFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const propertyId: number | undefined = route.params?.propertyId;
  const isEditing = !!propertyId;

  const { data: existingProperty, isLoading: loadingExisting } = useGetPropertyQuery(propertyId!, {
    skip: !propertyId,
  });
  const [createProperty, { isLoading: creating }] = useCreatePropertyMutation();
  const [updateProperty, { isLoading: updating }] = useUpdatePropertyMutation();
  const [deleteProperty, { isLoading: deleting }] = useDeletePropertyMutation();

  const [type, setType] = useState<PropertyType>("apartment");
  const [apartmentType, setApartmentType] = useState<(typeof APARTMENT_TYPES)[number]>("F2");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [wilaya, setWilaya] = useState<string | null>(null);
  const [status, setStatus] = useState<"available" | "rented">("available");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (existingProperty) {
      setType(existingProperty.type as PropertyType);
      if (existingProperty.apartmentType) setApartmentType(existingProperty.apartmentType as any);
      setDescription(existingProperty.description ?? "");
      setPrice(String(existingProperty.price));
      setWilaya(existingProperty.wilaya);
      setStatus(existingProperty.status as "available" | "rented");
      setPhotos(existingProperty.photos ?? []);
    }
  }, [existingProperty]);

  const handleAddPhoto = () => {
    if (photoUrl.trim()) {
      setPhotos((prev) => [...prev, photoUrl.trim()]);
      setPhotoUrl("");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description.trim() || !price.trim() || !wilaya) {
      Alert.alert("Champs manquants", "Merci de remplir la description, le prix et la wilaya.");
      return;
    }
    const body = {
      type,
      apartmentType: type === "apartment" ? apartmentType : undefined,
      description: description.trim(),
      price: Number(price),
      wilaya,
      status,
      photos,
    };

    try {
      if (isEditing) {
        await updateProperty({ id: propertyId!, body }).unwrap();
        Alert.alert("Modifié", "Le bien a été mis à jour.", [{ text: "OK", onPress: () => navigation.goBack() }]);
      } else {
        await createProperty(body).unwrap();
        Alert.alert("Publié", "Le bien a été ajouté.", [{ text: "OK", onPress: () => navigation.goBack() }]);
      }
    } catch {
      Alert.alert("Erreur", "Impossible d'enregistrer ce bien. Réessayez.");
    }
  };

  const handleDelete = () => {
    Alert.alert("Supprimer ce bien ?", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProperty(propertyId!).unwrap();
            navigation.goBack();
          } catch {
            Alert.alert("Erreur", "Impossible de supprimer ce bien.");
          }
        },
      },
    ]);
  };

  if (isEditing && loadingExisting) {
    return (
      <View style={styles.centerFill}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isSubmitting = creating || updating;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "Modifier le bien" : "Ajouter un bien"}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Type</Text>
        <View style={styles.typeRow}>
          {(["apartment", "villa"] as PropertyType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, type === t && styles.typeChipActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                {t === "apartment" ? "Appartement" : "Villa"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {type === "apartment" ? (
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

        <Text style={styles.sectionTitle}>Wilaya</Text>
        <WilayaPicker selectedWilaya={wilaya} onSelectWilaya={setWilaya} />

        <Text style={styles.sectionTitle}>Prix (DA)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 8500000"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.sectionTitle}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Décrivez le bien..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.sectionTitle}>Statut</Text>
        <View style={styles.typeRow}>
          {(["available", "rented"] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.typeChip, status === s && styles.typeChipActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.typeChipText, status === s && styles.typeChipTextActive]}>
                {s === "available" ? "Disponible" : "Loué"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Photos</Text>
        <View style={styles.photoInputRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="URL de la photo"
            value={photoUrl}
            onChangeText={setPhotoUrl}
            autoCapitalize="none"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {photos.map((url, index) => (
          <View key={index} style={styles.photoRow}>
            <Text style={styles.photoUrl} numberOfLines={1}>
              {url}
            </Text>
            <TouchableOpacity onPress={() => handleRemovePhoto(index)}>
              <Ionicons name="close-circle" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.85}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{isEditing ? "Enregistrer les modifications" : "Publier le bien"}</Text>
          )}
        </TouchableOpacity>

        {isEditing ? (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={deleting} activeOpacity={0.85}>
            {deleting ? (
              <ActivityIndicator color={colors.danger} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                <Text style={styles.deleteButtonText}>Supprimer ce bien</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
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
  photoInputRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  addPhotoButton: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  photoUrl: { ...typography.caption, color: colors.textSecondary, flex: 1, marginRight: spacing.sm },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
    ...shadow.card,
  },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  deleteButtonText: { ...typography.bodyMedium, color: colors.danger },
});