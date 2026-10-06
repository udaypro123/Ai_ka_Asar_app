import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../../src/store/hooks';
import { AimargLoader } from '../../src/components/common/AimargLoader';
import { adminService } from '../../src/services/admin.service';
import { AdminStats, User } from '../../src/types';
import { borderRadius, colors, spacing, typography } from '../../src/theme';
import { GradientScrollView } from '../../src/components/common/BackgroundGradient';
import { useAppRouter as useRouter } from '@/navigation';
import { usePageRefresh } from '../../src/components/common/PageRefresh';
import { ToastOnlyNotice } from '../../src/components/common/ToastOnlyNotice';

export default function UsersListScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('HR');
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) void loadData().catch(() => undefined);
  }, [isAdmin, loadData]);

  usePageRefresh(loadData);

  if (!isAdmin) {
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
    <GradientScrollView contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>All Users</Text>
      <Text style={styles.subtitle}>Total: {users.length} users</Text>

      <View style={styles.card}>
        {users.length === 0 ? (
          <Text style={styles.emptyText}>No users yet</Text>
        ) : (
          users.map((u) => (
            <Pressable
              key={u._id}
              style={styles.listItem}
              onPress={() => router.push(`/(admin)/user-detail?userId=${u._id}` as any)}
            >
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemTitle}>{u.name}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{u.roles[0]}</Text>
                </View>
              </View>
              <Text style={styles.listItemSubtitle}>{u.email}</Text>
              {u.currentRole && (
                <Text style={styles.listItemDetail}>{u.currentRole} {u.company ? `at ${u.company}` : ''}</Text>
              )}
              {u.mobile && (
                <Text style={styles.listItemDetail}>Mobile: {u.mobile}</Text>
              )}
              <Text style={styles.listItemDate}>
                Joined {new Date(u.createdAt).toLocaleDateString()}
              </Text>
            </Pressable>
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
  listItemDetail: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
