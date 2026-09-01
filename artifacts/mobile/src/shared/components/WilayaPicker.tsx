import { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography } from "../theme/theme";
import { WILAYAS } from "../constants/wilayas";

type WilayaPickerProps = {
  selectedWilaya: string | null;
  onSelectWilaya: (wilaya: string | null) => void;
  quickCount?: number;
};

export default function WilayaPicker({ selectedWilaya, onSelectWilaya, quickCount = 8 }: WilayaPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const quickWilayas = WILAYAS.slice(0, quickCount);

  return (
    <View style={styles.wilayaRow}>
      <TouchableOpacity style={styles.wilayaAllButton} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Ionicons name="map" size={18} color={colors.primary} />
      </TouchableOpacity>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ code: "00", name: "Toutes" }, ...quickWilayas]}
        keyExtractor={(item) => item.code}
        style={styles.wilayaList}
        contentContainerStyle={{ gap: spacing.sm }}
        renderItem={({ item }) => {
          const isAll = item.code === "00";
          const active = isAll ? selectedWilaya === null : selectedWilaya === item.name;
          return (
            <TouchableOpacity
              style={[styles.wilayaChip, active && styles.wilayaChipActive]}
              onPress={() => onSelectWilaya(isAll ? null : item.name)}
              activeOpacity={0.8}
            >
              <Text style={[styles.wilayaChipText, active && styles.wilayaChipTextActive]}>
                {isAll ? "Toutes" : `${item.code} - ${item.name}`}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choisir une wilaya</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={WILAYAS}
            keyExtractor={(item) => item.code}
            numColumns={2}
            columnWrapperStyle={{ gap: spacing.sm }}
            contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
            ListHeaderComponent={
              <TouchableOpacity
                style={[styles.modalRow, selectedWilaya === null && styles.modalRowActive]}
                onPress={() => {
                  onSelectWilaya(null);
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.modalRowText, selectedWilaya === null && styles.modalRowTextActive]}>
                  Toutes les wilayas
                </Text>
              </TouchableOpacity>
            }
            renderItem={({ item }) => {
              const active = selectedWilaya === item.name;
              return (
                <TouchableOpacity
                  style={[styles.modalRow, styles.modalRowHalf, active && styles.modalRowActive]}
                  onPress={() => {
                    onSelectWilaya(item.name);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalRowText, active && styles.modalRowTextActive]}>
                    {item.code} - {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wilayaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    paddingLeft: spacing.md,
  },
  wilayaAllButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  wilayaList: {
    flexGrow: 0,
    paddingRight: spacing.md,
  },
  wilayaChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  wilayaChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  wilayaChipText: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  wilayaChipTextActive: {
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  modalRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalRowHalf: {
    flex: 1,
  },
  modalRowActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modalRowText: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  modalRowTextActive: {
    color: "#fff",
  },
});