import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../../src/store/hooks';
import { AimargLoader } from '../../src/components/common/AimargLoader';
import { adminService } from '../../src/services/admin.service';
import { userLikeService } from '../../src/services/social.service';
import { AdminStats, User } from '../../src/types';
import { borderRadius, colors, spacing, typography } from '../../src/theme';
import { GradientScrollView } from '../../src/components/common/BackgroundGradient';
import { CommunityUserModal, UserWithInteractions } from '../../src/components/common/CommunityUserModal';
import { usePageRefresh } from '../../src/components/common/PageRefresh';
import { ToastOnlyNotice } from '../../src/components/common/ToastOnlyNotice';
import { useToast } from '../../src/components/common/Toast';
import { getApiErrorMessage } from '../../src/utils/apiError';

export default function AdminUsersScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserWithInteractions[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithInteractions | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { showToast } = useToast();

  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setLoadError(false);
      const [statsData, usersData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllUsers(),
      ]);
      let interactionSummary: Awaited<ReturnType<typeof userLikeService.getInteractionSummary>> = [];
      try {
        interactionSummary = await userLikeService.getInteractionSummary();
      } catch {
        // Keep the user list available if interaction totals cannot be loaded.
      }
      const interactionsByUserId = new Map(interactionSummary.map((item) => [item.targetUserId, item]));
      setStats(statsData);
      setUsers(usersData
        .filter((targetUser) => !targetUser.roles?.includes('ADMIN') && !targetUser.roles?.includes('SUPER_ADMIN'))
        .map((targetUser) => {
          const interaction = interactionsByUserId.get(targetUser._id);
          return {
            ...targetUser,
            likeCount: interaction?.likeCount ?? 0,
            commentCount: interaction?.commentCount ?? 0,
            likedByMe: interaction?.likedByMe ?? false,
          };
        }));
    } catch (error: unknown) {
      setLoadError(true);
      showToast(getApiErrorMessage(error, 'Failed to refresh the account list.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isAdmin) void loadData().catch(() => undefined);
  }, [isAdmin, loadData]);

  usePageRefresh(loadData);

  const updateBlockedStatus = async (targetUser: User) => {
    const isBlocked = !targetUser.isBlocked;
    setUpdatingUserId(targetUser._id);
    try {
      const result = await adminService.setUserBlockedStatus(targetUser._id, isBlocked);
      setUsers((previousUsers) => previousUsers.map((item) =>
        item._id === targetUser._id ? { ...item, isBlocked: result.isBlocked } : item
      ));
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Could not update this account. Please try again.'), 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const confirmBlockedStatusChange = (targetUser: User) => {
    const isBlocked = !targetUser.isBlocked;
    Alert.alert(
      isBlocked ? 'Block account?' : 'Unblock account?',
      `${targetUser.name} will ${isBlocked ? 'not be able to access' : 'be able to access'} the app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isBlocked ? 'Block' : 'Unblock',
          style: isBlocked ? 'destructive' : 'default',
          onPress: () => void updateBlockedStatus(targetUser),
        },
      ]
    );
  };

  const applyInteractionChange = (
    targetUserId: string,
    interaction: Pick<UserWithInteractions, 'likeCount' | 'commentCount' | 'likedByMe'>
  ) => {
    setUsers((previousUsers) => previousUsers.map((targetUser) =>
      targetUser._id === targetUserId ? { ...targetUser, ...interaction } : targetUser
    ));
    setSelectedUser((previousUser) => previousUser?._id === targetUserId
      ? { ...previousUser, ...interaction }
      : previousUser
    );
  };

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
      <Text style={styles.subtitle}>Total: {stats?.totalUsers ?? users.length} users</Text>

      {loadError ? (
        <View style={styles.emptyState}>
          <Pressable style={styles.retryButton} onPress={() => void loadData()}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No users yet</Text>
        </View>
      ) : (
        <View style={styles.usersList}>
          {users.map((targetUser) => (
            <View key={targetUser._id} style={styles.userCard}>
              <Pressable
                style={styles.cardContent}
                onPress={() => setSelectedUser(targetUser)}
              >
                <View style={styles.userCardHeader}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {targetUser.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.userCardInfo}>
                    <Text style={styles.userName}>{targetUser.name}</Text>
                    <Text style={styles.userRole}>
                      {targetUser.currentRole || targetUser.roles?.[0] || 'USER'}
                      {targetUser.company ? ` at ${targetUser.company}` : ''}
                    </Text>
                    <Text style={styles.userEmail}>{targetUser.email}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </View>
                {targetUser.mobile && <Text style={styles.userDetail}>Mobile: {targetUser.mobile}</Text>}
                {targetUser.profession && <Text style={styles.userDetail}>{targetUser.profession}</Text>}
                {targetUser.skills && targetUser.skills.length > 0 && (
                  <View style={styles.skillsRow}>
                    {targetUser.skills.slice(0, 4).map((skill, index) => (
                      <View key={`${targetUser._id}-${skill}-${index}`} style={styles.skillBadge}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                    {targetUser.skills.length > 4 && (
                      <Text style={styles.moreSkills}>+{targetUser.skills.length - 4}</Text>
                    )}
                  </View>
                )}
                {targetUser.jobDescription && (
                  <Text style={styles.jobDescription} numberOfLines={2}>{targetUser.jobDescription}</Text>
                )}
                <Text style={styles.joinedText}>Joined {new Date(targetUser.createdAt).toLocaleDateString()}</Text>
                <View style={styles.interactionRow}>
                  <Text style={styles.interactionText}>❤️ {targetUser.likeCount} likes</Text>
                  <Text style={styles.interactionText}>💬 {targetUser.commentCount} comments</Text>
                </View>
              </Pressable>
              <View style={styles.cardFooter}>
                <Text style={[styles.accountStatus, targetUser.isBlocked && styles.blockedStatus]}>
                  {targetUser.isBlocked ? 'Blocked' : 'Active'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${targetUser.isBlocked ? 'Unblock' : 'Block'} ${targetUser.name}`}
                  disabled={updatingUserId === targetUser._id}
                  style={[styles.blockButton, targetUser.isBlocked && styles.unblockButton]}
                  onPress={() => confirmBlockedStatusChange(targetUser)}
                >
                  <Text style={[styles.blockButtonText, targetUser.isBlocked && styles.unblockButtonText]}>
                    {updatingUserId === targetUser._id
                      ? 'Updating...'
                      : targetUser.isBlocked ? 'Unblock' : 'Block'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
      {selectedUser && (
        <CommunityUserModal
          key={selectedUser._id}
          user={selectedUser}
          currentUserId={user?._id}
          onClose={() => setSelectedUser(null)}
          onInteractionChange={applyInteractionChange}
        />
      )}
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
  usersList: {
    gap: spacing.md,
  },
  userCard: {
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    elevation: 4,
    shadowColor: colors.auth.glow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardContent: {
    marginBottom: spacing.md,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  userCardInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
    marginBottom: 2,
  },
  userRole: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
  },
  arrow: {
    fontSize: 24,
    color: colors.auth.textSecondary,
    fontWeight: '300',
  },
  userDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    marginBottom: spacing.xs,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  skillBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  skillText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primaryDark,
  },
  moreSkills: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
  },
  jobDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.auth.textTertiary,
    lineHeight: 16,
    marginTop: spacing.sm,
  },
  joinedText: {
    fontSize: typography.fontSize.xs,
    color: colors.auth.textTertiary,
    marginTop: spacing.sm,
  },
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  interactionText: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.auth.cardBorder,
    paddingTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountStatus: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.success,
  },
  blockedStatus: {
    color: colors.error,
  },
  blockButton: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  blockButtonText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  unblockButton: {
    borderColor: colors.success,
  },
  unblockButtonText: {
    color: colors.success,
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
  emptyState: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});