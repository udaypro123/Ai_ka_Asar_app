import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../src/store/hooks';
import { adminService } from '../../src/services/admin.service';
import { AdminStats, RecentActivity } from '../../src/types';
import { borderRadius, colors, spacing, typography } from '../../src/theme';
import { GradientScrollView } from '../../src/components/common/BackgroundGradient';

export default function AdminDashboardScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('HR');

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentActivity(),
      ]);
      setStats(statsData);
      setActivity(activityData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (!isAdmin) {
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
    <GradientScrollView contentContainerStyle={styles.content} refreshing={refreshing} onRefresh={onRefresh}>
      <Text style={styles.greeting}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Welcome back, {user?.name?.split(' ')[0] || 'Admin'}</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.todayUsers || 0}</Text>
          <Text style={styles.statLabel}>Today's Users</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Users</Text>
      <View style={styles.card}>
        {stats?.recentUsers?.length === 0 ? (
          <Text style={styles.emptyText}>No users yet</Text>
        ) : (
          stats?.recentUsers?.map((u) => (
            <View key={u._id} style={styles.listItem}>
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

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.card}>
        {activity.length === 0 ? (
          <Text style={styles.emptyText}>No recent activity</Text>
        ) : (
          activity.map((item) => (
            <View key={item._id} style={styles.listItem}>
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemTitle}>{item.name}</Text>
                <Text style={styles.listItemDate}>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.listItemSubtitle}>{item.email}</Text>
              <Text style={styles.activityText}>Profile updated</Text>
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
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
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
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    fontWeight: typography.fontWeight.medium,
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
  activityText: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    fontStyle: 'italic',
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