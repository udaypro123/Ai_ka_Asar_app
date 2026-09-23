import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useMemo } from 'react';
import { useAppSelector } from '../../src/store/hooks';
import { borderRadius, colors, spacing, typography } from '@/theme';
import { GradientScrollView } from '@/components/common/BackgroundGradient';

export default function HomeScreen() {
  const { user } = useAppSelector((state) => state.auth);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  }, []);

  return (
    <GradientScrollView contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>{greeting}, {user?.name?.split(' ')?.[0] || 'User'}</Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Your Career Status</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>AI Impact</Text>
            <Text style={styles.statusValue}>{user?.aiImpactStatus || 'Not assessed'}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Employment</Text>
            <Text style={styles.statusValue}>{user?.employmentStatus || 'Not set'}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Skill Progress</Text>
            <Text style={styles.statusValue}>0%</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Career Journey</Text>
            <Text style={styles.statusValue}>0 / 7 milestones</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recommended Next Step</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Complete AI Impact Assessment</Text>
        <Text style={styles.cardDescription}>
          Understand how AI is affecting your career and get personalized recommendations.
        </Text>
        <Pressable style={styles.cardButton}>
          <Text style={styles.cardButtonText}>Start Assessment</Text>
        </Pressable>
      </View>
    </GradientScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.auth.text,
    marginBottom: spacing.lg,
  },
  statusCard: {
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    elevation: 6,
    shadowColor: colors.auth.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  statusTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
    marginBottom: spacing.md,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '48%',
    marginBottom: spacing.md,
  },
  statusLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.auth.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
    marginBottom: spacing.md,
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
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
    marginBottom: spacing.sm,
  },
  cardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  cardButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryDark,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  cardButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
