import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useToast } from '../../src/components/common/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '@/theme';

export default function AssessmentScreen() {
  const [selectedStatus, setSelectedStatus] = useState('');
  const router = useRouter();
  const toast = useToast();

  const employmentOptions = [
    'Employed',
    'Self-employed',
    'Freelancer',
    'Student',
    'Looking for work',
    'Unemployed',
    'Career transition',
  ];

  const impactOptions = [
    'No noticeable impact',
    'My tasks changed',
    'My workload decreased',
    'My income decreased',
    'My responsibilities changed',
    'My job is at risk',
    'I lost my job',
    'I changed my profession',
    'AI is helping me become more productive',
  ];

  const handleNext = () => {
    if (!selectedStatus) {
      toast.showToast('Please select your employment status', 'error');
      return;
    }
      router.replace('/(user)' as any);
  };

  return (
    <LinearGradient
      colors={[colors.auth.bgStart, colors.auth.bgEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>AI Impact Assessment</Text>
        <Text style={styles.subtitle}>Tell us how AI is affecting your work</Text>

        <Text style={styles.label}>What best describes your current situation?</Text>
        <View style={styles.optionsContainer}>
          {employmentOptions.map((option) => (
            <Pressable
              key={option}
              style={[styles.option, selectedStatus === option && styles.selectedOption]}
              onPress={() => setSelectedStatus(option)}
            >
              <Text style={[styles.optionText, selectedStatus === option && styles.selectedOptionText]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Complete Assessment</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.auth.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.auth.textSecondary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
    marginBottom: spacing.md,
  },
  optionsContainer: {
    marginBottom: spacing.lg,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.auth.inputBg,
  },
  selectedOption: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.text,
  },
  selectedOptionText: {
    color: colors.primaryDark,
    fontWeight: typography.fontWeight.semibold,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
