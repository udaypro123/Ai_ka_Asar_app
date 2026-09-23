import { GradientScrollView } from '@/components/common/BackgroundGradient';
import { borderRadius, colors, spacing, typography } from '@/theme';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

export default function CareerScreen() {
  const milestones = [
    { key: 'assessment', label: 'Assessment', completed: true },
    { key: 'skill-gap', label: 'Skill Gap', completed: true },
    { key: 'learning', label: 'Learning', completed: true },
    { key: 'project', label: 'Project', completed: false },
    { key: 'applications', label: 'Applications', completed: false },
    { key: 'interview', label: 'Interview', completed: false },
    { key: 'transition', label: 'Career Transition', completed: false },
  ];

  return (
    <GradientScrollView contentContainerStyle={styles.content}>

      <View style={styles.timeline}>
        {milestones.map((milestone, index) => (
          <View key={milestone.key} style={styles.timelineItem}>
            <View
              style={[
                styles.timelineDot,
                milestone.completed && styles.timelineDotCompleted,
              ]}
            />
            {index < milestones.length - 1 && (
              <View
                style={[
                  styles.timelineLine,
                  milestone.completed && styles.timelineLineCompleted,
                ]}
              />
            )}
            <View style={styles.timelineContent}>
              <Text
                style={[
                  styles.timelineLabel,
                  milestone.completed && styles.timelineLabelCompleted,
                ]}
              >
                {milestone.label}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progress</Text>
        <Text style={styles.cardValue}>3 / 7 milestones completed</Text>
      </View>
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
  timeline: {
    marginBottom: spacing.lg,
    marginTop:15,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.auth.textTertiary,
    marginRight: spacing.md,
    marginTop: 4,
    borderWidth: 2,
    borderColor: colors.auth.cardBorder,
  },
  timelineDotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.auth.cardBorder,
    marginRight: spacing.md,
    minHeight: 24,
  },
  timelineLineCompleted: {
    backgroundColor: colors.success,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  timelineLabel: {
    fontSize: typography.fontSize.base,
    color: colors.auth.textTertiary,
    fontWeight: typography.fontWeight.medium,
  },
  timelineLabelCompleted: {
    color: colors.auth.text,
    fontWeight: typography.fontWeight.semibold,
  },
  card: {
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    elevation: 6,
    shadowColor: colors.auth.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  cardTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
  },
});
