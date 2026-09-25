import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useToast } from '../../src/components/common/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '@/theme';

export default function CareerProfileScreen() {
  const [experience, setExperience] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [skills, setSkills] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const router = useRouter();
  const toast = useToast();

  const handleNext = () => {
    if (!employmentStatus) {
      toast.showToast('Please select your employment status', 'error');
      return;
    }
    router.replace('(onboarding)/assessment');
  };

  return (
    <LinearGradient
      colors={[colors.auth.bgStart, colors.auth.bgEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Complete Your Career Profile</Text>
        <Text style={styles.subtitle}>Tell us about your career background</Text>

        <TextInput
          style={styles.input}
          placeholder="Years of Experience"
          value={experience}
          onChangeText={setExperience}
          keyboardType="numeric"
          placeholderTextColor={colors.auth.textSecondary}
        />

        <TextInput
          style={styles.input}
          placeholder="Employment Status (e.g. Employed, Freelancer)"
          value={employmentStatus}
          onChangeText={setEmploymentStatus}
          placeholderTextColor={colors.auth.textSecondary}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Current Skills (comma separated)"
          value={skills}
          onChangeText={setSkills}
          multiline
          numberOfLines={4}
          placeholderTextColor={colors.auth.textSecondary}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Career Goal"
          value={careerGoal}
          onChangeText={setCareerGoal}
          multiline
          numberOfLines={4}
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
