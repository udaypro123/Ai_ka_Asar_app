import { View, Text, StyleSheet } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../../src/store/hooks';
import { AimargLoader } from '../../src/components/common/AimargLoader';
import { adminService } from '../../src/services/admin.service';
import { AdminStats, RecentActivity } from '../../src/types';
import { borderRadius, colors, spacing, typography } from '../../src/theme';
import { GradientScrollView } from '../../src/components/common/BackgroundGradient';
import { ToastOnlyNotice } from '../../src/components/common/ToastOnlyNotice';
import { useToast } from '../../src/components/common/Toast';
import { getApiErrorMessage } from '../../src/utils/apiError';
import { MyPostActivity } from '../../src/components/common/MyPostActivity';
import { ProfileInteractions } from '../../src/components/common/ProfileInteractions';

export default function HRDashboardScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const { showToast } = useToast();

  const isHR = user?.roles?.includes('HR');

  const loadData = useCallback(async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentActivity(),
      ]);
      setStats(statsData);
      setActivity(activityData);
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Could not load the HR dashboard.'), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isHR) loadData();
  }, [isHR, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    setActivityRefreshKey((key) => key + 1);
    loadData();
  };

  if (!isHR) {
    return <ToastOnlyNotice message="You do not have permission to view this page." />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <AimargLoader />
      </View>
    );
  }

  return (
    <GradientScrollView contentContainerStyle={styles.content} refreshing={refreshing} onRefresh={onRefresh}>
      <Text style={styles.greeting}>HR Dashboard</Text>
      <Text style={styles.subtitle}>Welcome back, {user?.name?.split(' ')[0] || 'HR'}</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
          <Text style={styles.statLabel}>Total Candidates</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.todayUsers || 0}</Text>
          <Text style={styles.statLabel}>New Today</Text>
        </View>
      </View>

      <MyPostActivity refreshKey={activityRefreshKey} />
      <ProfileInteractions refreshKey={activityRefreshKey} />

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.card}>
        {activity.length === 0 ? (
          <Text style={styles.emptyText}>No recent activity</Text>
        ) : (
          activity.slice(0, 10).map((item) => (
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});