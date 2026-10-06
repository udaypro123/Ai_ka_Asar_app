import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../../src/store/hooks';
import { AimargLoader } from '../../src/components/common/AimargLoader';
import { adminService } from '../../src/services/admin.service';
import { userLikeService } from '../../src/services/social.service';
import { AdminStats } from '../../src/types';
import { borderRadius, colors, spacing, typography } from '../../src/theme';
import { GradientScrollView } from '../../src/components/common/BackgroundGradient';
import { CommunityUserModal, UserWithInteractions } from '../../src/components/common/CommunityUserModal';
import { ResumeDownloadButton } from '../../src/components/common/ResumeDownloadButton';
import { usePageRefresh } from '../../src/components/common/PageRefresh';
import { ToastOnlyNotice } from '../../src/components/common/ToastOnlyNotice';
import { useToast } from '../../src/components/common/Toast';
import { getApiErrorMessage } from '../../src/utils/apiError';

const fetchCandidates = async (currentUserId?: string) => {
  const [statsData, usersData] = await Promise.all([
    adminService.getDashboardStats(),
    adminService.getAllUsers(),
  ]);
  let interactionSummary: Awaited<ReturnType<typeof userLikeService.getInteractionSummary>> = [];
  try {
    interactionSummary = await userLikeService.getInteractionSummary();
  } catch {
    // Keep the candidate list available if interaction totals cannot be loaded.
  }
  const interactionsByUserId = new Map(interactionSummary.map((item) => [item.targetUserId, item]));
  const visibleUsers = usersData.filter((targetUser) =>
    targetUser._id !== currentUserId &&
    !targetUser.roles?.includes('ADMIN') &&
    !targetUser.roles?.includes('SUPER_ADMIN')
  );

  return {
    stats: statsData,
    users: visibleUsers.map((targetUser) => {
      const interaction = interactionsByUserId.get(targetUser._id);
      return {
        ...targetUser,
        likeCount: interaction?.likeCount ?? 0,
        commentCount: interaction?.commentCount ?? 0,
        likedByMe: interaction?.likedByMe ?? false,
      };
    }),
  };
};

export default function HRCandidatesScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserWithInteractions[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithInteractions | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { showToast } = useToast();

  const isHR = user?.roles?.includes('HR');

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const result = await fetchCandidates(user?._id);
        setStats(result.stats);
        setUsers(result.users);
    } catch (error: unknown) {
      setLoadError(true);
      showToast(getApiErrorMessage(error, 'Could not load candidates.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, user?._id]);

  useEffect(() => {
    if (isHR) void loadData().catch(() => undefined);
  }, [isHR, loadData]);

  usePageRefresh(loadData);

  const retryLoading = () => void loadData().catch(() => undefined);

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
    <GradientScrollView contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Candidates</Text>
      <Text style={styles.subtitle}>Total: {stats?.totalUsers ?? users.length} candidates</Text>

      {loadError ? (
        <View style={styles.emptyState}>
          <Pressable style={styles.retryButton} onPress={retryLoading}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No candidates yet</Text>
        </View>
      ) : (
        <View style={styles.usersList}>
          {users.map((targetUser) => (
            <View key={targetUser._id} style={styles.userCard}>
              <Pressable style={styles.cardContent} onPress={() => setSelectedUser(targetUser)}>
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
              {targetUser.resume && <ResumeDownloadButton userId={targetUser._id} compact />}
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