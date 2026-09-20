import { useState, useEffect } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { colors, spacing, radius, typography, shadow } from "../../shared/theme/theme";
import {
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} from "../../core/api/apiSlice";
import WilayaPicker from "../../shared/components/WilayaPicker";
import VideoBackgroundHeader from "../../shared/components/VideoBackgroundHeader";
import AnimatedPressable from "../../shared/components/AnimatedPressable";
import FadeIn from "../../shared/components/FadeIn";
import SkeletonCard from "../../shared/components/SkeletonCard";

type PropertyType = "apartment" | "villa";
const APARTMENT_TYPES = ["F1", "F2", "F3", "F4", "F5"] as const;

export default function VendorPropertyFormScreen() {
  const { t } = useTranslation();
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
      Alert.alert(t("vendor.error"), t("vendor.requiredProperty"));
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
        Alert.alert(t("common.ok"), t("vendor.updated"), [{ text: t("common.ok"), onPress: () => navigation.goBack() }]);
      } else {
        await createProperty(body).unwrap();
        Alert.alert(t("common.ok"), t("vendor.published"), [{ text: t("common.ok"), onPress: () => navigation.goBack() }]);
      }
    } catch {
      Alert.alert(t("vendor.error"), t("vendor.saveError"));
    }
  };

  const handleDelete = () => {
    Alert.alert(t("vendor.deleteProperty"), t("vendor.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProperty(propertyId!).unwrap();
            navigation.goBack();
          } catch {
            Alert.alert(t("vendor.error"), t("vendor.deleteError"));
          }
        },
      },
    ]);
  };

  if (isEditing && loadingExisting) {
    return (
      <View style={styles.loading}><SkeletonCard /></View>
    );
  }

  const isSubmitting = creating || updating;

  return (
    <View style={styles.container}>
      <VideoBackgroundHeader>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? t("vendor.formEdit") : t("vendor.formAdd")}</Text>
      </View>
      </VideoBackgroundHeader>

      <FadeIn><KeyboardAvoidingView
        style={styles.formWrapper}
        behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}
      >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>{t("vendor.type")}</Text>
        <View style={styles.typeRow}>
          {(["apartment", "villa"] as PropertyType[]).map((propertyTypeOption) => (
            <TouchableOpacity
              key={propertyTypeOption}
              style={[styles.typeChip, type === propertyTypeOption && styles.typeChipActive]}
              onPress={() => setType(propertyTypeOption)}
            >
              <Text style={[styles.typeChipText, type === propertyTypeOption && styles.typeChipTextActive]}>
                {propertyTypeOption === "apartment" ? t("vendor.apartment") : t("vendor.villa")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {type === "apartment" ? (
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

        <Text style={styles.sectionTitle}>{t("vendor.wilayaRequired")}</Text>
        <WilayaPicker selectedWilaya={wilaya} onSelectWilaya={setWilaya} />

        <Text style={styles.sectionTitle}>{t("vendor.price")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("properties.inputPrice")}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.sectionTitle}>{t("vendor.description")}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t("vendor.description")}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.sectionTitle}>{t("properties.status")}</Text>
        <View style={styles.typeRow}>
          {(["available", "rented"] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.typeChip, status === s && styles.typeChipActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.typeChipText, status === s && styles.typeChipTextActive]}>
                {s === "available" ? t("vendor.available") : t("vendor.rented")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t("vendor.photos")}</Text>
        <View style={styles.photoInputRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder={t("vendor.photoUrl")}
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

        <AnimatedPressable style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{isEditing ? t("vendor.saveChanges") : t("vendor.publish")}</Text>
          )}
        </AnimatedPressable>

        {isEditing ? (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={deleting} activeOpacity={0.85}>
            {deleting ? (
              <ActivityIndicator color={colors.danger} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                <Text style={styles.deleteButtonText}>{t("vendor.deleteProperty")}</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </ScrollView>
      </KeyboardAvoidingView>
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  formWrapper: { flex: 1 },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: "center", backgroundColor: colors.background },
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
  typeRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
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