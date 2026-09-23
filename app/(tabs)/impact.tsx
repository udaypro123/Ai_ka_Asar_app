import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { borderRadius, colors, spacing, typography } from '@/theme';
import { GradientScrollView } from '@/components/common/BackgroundGradient';


export default function ImpactScreen() {
  const [lastAssessment, setLastAssessment] = useState('Not completed');

  const impactAreas = [
    { name: 'Coding', level: 'High' },
    { name: 'Testing', level: 'Medium' },
    { name: 'Documentation', level: 'Medium' },
  ];

  return (
    <GradientScrollView contentContainerStyle={styles.content}>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Status</Text>
        <Text style={styles.cardValue}>{lastAssessment}</Text>
      </View>

      <Text style={styles.sectionTitle}>Affected Areas</Text>
      {impactAreas.map((area, index) => (
        <View key={index} style={styles.areaItem}>
          <Text style={styles.areaName}>{area.name}</Text>
          <View style={styles.levelContainer}>
            <View
              style={[
                styles.levelIndicator,
                area.level === 'High' && styles.levelHigh,
                area.level === 'Medium' && styles.levelMedium,
                area.level === 'Low' && styles.levelLow,
              ]}
            />
            <Text style={styles.levelText}>{area.level}</Text>
          </View>
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Last Updated</Text>
        <Text style={styles.cardValue}>21 Sep 2026</Text>
      </View>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Reassess</Text>
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
    marginTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
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
  areaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
  },
  areaName: {
    fontSize: typography.fontSize.base,
    color: colors.auth.text,
    fontWeight: typography.fontWeight.medium,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  levelHigh: {
    backgroundColor: colors.error,
  },
  levelMedium: {
    backgroundColor: colors.accent,
  },
  levelLow: {
    backgroundColor: colors.success,
  },
  levelText: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    fontWeight: typography.fontWeight.medium,
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
