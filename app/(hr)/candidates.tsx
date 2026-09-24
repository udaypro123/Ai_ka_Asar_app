import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../src/store/hooks';
import { adminService } from '../../src/services/admin.service';
import { AdminStats } from '../../src/types';
import { borderRadius, colors, spacing, typography } from '../../src/theme';
import { GradientScrollView } from '../../src/components/common/BackgroundGradient';

export default function HRCandidatesScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isHR = user?.roles?.includes('HR');

  useEffect(() => {
    if (isHR) {
      loadData();
    }
  }, [isHR]);

  const loadData = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isHR) {
    return (
      <GradientScrollView contentContainerStyle={styles.content}>
        <Text style={styles.errorText}>You do not have permission to view this page.</Text>
      </GradientScrollView>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GradientScrollView contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Candidates</Text>
      <Text style={styles.subtitle}>Total: {stats?.totalUsers || 0} candidates</Text>

      <View style={styles.card}>
        {stats?.recentUsers?.length === 0 ? (
          <Text style={styles.emptyText}>No candidates yet</Text>
        ) : (
          stats?.recentUsers?.map((u) => (
            <View key={u.id} style={styles.listItem}>
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemTitle}>{u.name}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{u.roles[0]}</Text>
                </View>
              </View>
              <Text style={styles.listItemSubtitle}>{u.email}</Text>
              <Text style={styles.listItemDate}>
                Joined {new Date(u.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.auth.textSecondary,
    marginBottom: spacing.lg,
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
  listItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.auth.cardBorder,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  listItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
  },
  listItemSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    marginBottom: spacing.xs,
  },
  listItemDate: {
    fontSize: typography.fontSize.xs,
    color: colors.auth.textTertiary,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  roleBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryDark,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});