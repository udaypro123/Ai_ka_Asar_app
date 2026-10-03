import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { useAppRouter as useRouter } from '@/navigation';
import { useToast } from '../../src/components/common/Toast';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, spacing, borderRadius } from '@/theme';

export default function ProfessionScreen() {
  const [profession, setProfession] = useState('');
  const [industry, setIndustry] = useState('');
  const router = useRouter();
  const toast = useToast();

  const handleNext = () => {
    if (!profession.trim()) {
      toast.showToast('Please enter your profession', 'error');
      return;
    }
    router.replace('/(onboarding)/career-profile');
  };

  return (
    <LinearGradient
      colors={[colors.auth.bgStart, colors.auth.bgEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What is your profession?</Text>
        <Text style={styles.subtitle}>This helps us provide relevant career insights</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Software Engineer"
          value={profession}
          onChangeText={setProfession}
          placeholderTextColor={colors.auth.textSecondary}
        />

        <TextInput
          style={styles.input}
          placeholder="Industry (optional)"
          value={industry}
          onChangeText={setIndustry}
          placeholderTextColor={colors.auth.textSecondary}
        />

        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Continue</Text>
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
  input: {
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.md,
    backgroundColor: colors.auth.inputBg,
    color: colors.auth.text,
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
