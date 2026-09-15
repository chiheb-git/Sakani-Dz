import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius, typography, shadow } from '../../shared/theme/theme';
import { supportedLanguages, type SupportedLanguage } from '../../core/i18n';
import VideoBackgroundHeader from '../../shared/components/VideoBackgroundHeader';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import FadeIn from '../../shared/components/FadeIn';

const options: { key: 'french' | 'arabic' | 'english'; value: SupportedLanguage }[] = [
  { key: 'french', value: 'fr' },
  { key: 'arabic', value: 'ar' },
  { key: 'english', value: 'en' },
];

export default function LanguageSelectionScreen({
  onSelect,
}: {
  onSelect?: (language: SupportedLanguage) => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<SupportedLanguage>('fr');

  return (
    <VideoBackgroundHeader style={styles.screenBackground}>
      <FadeIn style={styles.cardWrap}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('language.title')}</Text>
        <Text style={styles.subtitle}>{t('language.subtitle')}</Text>

        {options.map((option) => (
          <AnimatedPressable
            key={option.value}
            style={[styles.option, selected === option.value && styles.optionActive]}
            onPress={() => setSelected(option.value)}
          >
            <Text style={[styles.optionText, selected === option.value && styles.optionTextActive]}>{t(`language.${option.key}`)}</Text>
          </AnimatedPressable>
        ))}

        <AnimatedPressable
          style={styles.primaryButton}
          onPress={async () => {
            if (onSelect) await onSelect(selected);
          }}
        >
          <Text style={styles.primaryButtonText}>{t('language.continue')}</Text>
        </AnimatedPressable>
      </View>
      </FadeIn>
    </VideoBackgroundHeader>
  );
}

const styles = StyleSheet.create({
  screenBackground: { flex: 1 },
  cardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadow.card,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(15,42,67,0.08)',
  },
  optionText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  optionTextActive: {
    color: colors.primary,
  },
  primaryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.bodyMedium,
    color: '#fff',
  },
});
