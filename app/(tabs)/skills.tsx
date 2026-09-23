import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/theme';
import { GradientScrollView } from '@/components/common/BackgroundGradient';

export default function SkillsScreen() {
  const skills = [
    { name: 'JavaScript', current: 90, required: 90 },
    { name: 'React', current: 85, required: 85 },
    { name: 'Node.js', current: 80, required: 80 },
    { name: 'System Design', current: 40, required: 100 },
    { name: 'AI Integration', current: 20, required: 100 },
    { name: 'Cloud', current: 30, required: 100 },
  ];

  return (
    <GradientScrollView contentContainerStyle={styles.content}>

      <Text style={styles.sectionTitle}>Skill Gap Analysis</Text>

      {skills.map((skill, index) => (
        <View key={index} style={styles.skillItem}>
          <View style={styles.skillHeader}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <Text style={styles.skillPercent}>{skill.current}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${skill.current}%` },
                skill.current < 50 && styles.progressLow,
                skill.current >= 50 && skill.current < 80 && styles.progressMedium,
                skill.current >= 80 && styles.progressHigh,
              ]}
            />
          </View>
        </View>
      ))}

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Update Skills</Text>
      </Pressable>
    </GradientScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.auth.text,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
    marginBottom: spacing.md,
  },
  skillItem: {
    marginBottom: spacing.lg,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  skillName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.auth.text,
  },
  skillPercent: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  progressBar: {
    height: 10,
    backgroundColor: colors.auth.inputBg,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.md,
  },
  progressLow: {
    backgroundColor: colors.error,
  },
  progressMedium: {
    backgroundColor: colors.accent,
  },
  progressHigh: {
    backgroundColor: colors.success,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
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
