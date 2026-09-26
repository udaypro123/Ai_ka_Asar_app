import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAppSelector } from '../../src/store/hooks';
import { adminService, userLikeService } from '../../src/services/social.service';
import { borderRadius, colors, spacing, typography } from '../../src/theme';
import { GradientScrollView } from '../../src/components/common/BackgroundGradient';
import { useToast } from '../../src/components/common/Toast';
import { CommunityUserModal, UserWithInteractions } from '../../src/components/common/CommunityUserModal';

export default function CommunityScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<UserWithInteractions[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithInteractions | null>(null);
  const { showToast } = useToast();

  const currentUserId = user?._id;
  const targetUserIdsRef = useRef<string[]>([]);

  const applyInteractionSummary = useCallback((summary: Awaited<ReturnType<typeof userLikeService.getInteractionSummary>>) => {
    const summaryByUserId = new Map(summary.map((item) => [item.targetUserId, item]));
    const applyToUser = (targetUser: UserWithInteractions): UserWithInteractions => {
      const interaction = summaryByUserId.get(targetUser._id);
      return {
        ...targetUser,
        likeCount: interaction?.likeCount ?? 0,
        commentCount: interaction?.commentCount ?? 0,
        likedByMe: interaction?.likedByMe ?? false,
      };
    };

    setUsers((previousUsers) => previousUsers.map(applyToUser));
    setSelectedUser((previousUser) => previousUser ? applyToUser(previousUser) : previousUser);
  }, []);

  const refreshInteractionSummary = useCallback(async () => {
    const summary = await userLikeService.getInteractionSummary();
    applyInteractionSummary(summary);
  }, [applyInteractionSummary]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers();
      const filtered = (data || []).filter((u) => u._id !== currentUserId && !u.roles?.includes('ADMIN') && !u.roles?.includes('SUPER_ADMIN'));
      const usersWithMeta: UserWithInteractions[] = filtered.map((u) => ({
        ...u,
        likeCount: 0,
        commentCount: 0,
        likedByMe: false,
      }));
      targetUserIdsRef.current = usersWithMeta.map((targetUser) => targetUser._id);
      setUsers(usersWithMeta);
      try {
        await refreshInteractionSummary();
      } catch {
        showToast('Could not refresh community interactions', 'error');
      }
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, refreshInteractionSummary, showToast]);

  useFocusEffect(
    useCallback(() => {
      void loadUsers();
      const interval = setInterval(() => {
        if (targetUserIdsRef.current.length > 0) {
          void refreshInteractionSummary().catch(() => undefined);
        }
      }, 10000);
      return () => clearInterval(interval);
    }, [loadUsers, refreshInteractionSummary])
  );

  const openUser = (targetUser: UserWithInteractions) => {
    setSelectedUser(targetUser);
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

  return (
    <GradientScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Community</Text>
      <Text style={styles.subtitle}>Connect with professionals and share AI impact insights</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No users yet</Text>
        </View>
      ) : (
        <View style={styles.usersList}>
          {users.map((u) => (
            <Pressable key={u._id} style={styles.userCard} onPress={() => openUser(u)}>
              <View style={styles.userCardHeader}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {u.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.userCardInfo}>
                  <Text style={styles.userName}>{u.name}</Text>
                  <Text style={styles.userRole}>
                    {u.currentRole || u.roles[0] || 'USER'}
                    {u.company ? ` at ${u.company}` : ''}
                  </Text>
                  {u.mobile && <Text style={styles.userMobile}>{u.mobile}</Text>}
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </View>

              {(u.skills && u.skills.length > 0) && (
                <View style={styles.userSkillsRow}>
                  {u.skills.slice(0, 4).map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                  {u.skills.length > 4 && (
                    <Text style={styles.moreSkills}>+{u.skills.length - 4}</Text>
                  )}
                </View>
              )}

              {u?.jobDescription && (
                <>
                  <Text style={styles.sectionTitleMaicard}>Job Description</Text>
                  <Text style={styles.descriptionText}>{u?.jobDescription}</Text>
                </>
              )}

              <View style={styles.userCardFooter}>
                <View style={styles.userDetailRow}>
                  <Text style={styles.interactionText}>
                    ❤️ {u.likeCount} likes
                  </Text>
                  <Text style={styles.interactionText}>
                    💬 {u.commentCount} comments
                  </Text>
                </View>


              </View>
            </Pressable>
          ))}
        </View>
      )}

      {selectedUser && (
        <CommunityUserModal
          key={selectedUser._id}
          user={selectedUser}
          currentUserId={currentUserId}
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
  title: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyCard: {
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.auth.textSecondary,
    textAlign: 'center',
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
  userMobile: {
    fontSize: typography.fontSize.xs,
    color: colors.auth.textSecondary,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    color: colors.auth.textSecondary,
    fontWeight: '300',
  },
  userSkillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
    fontWeight: typography.fontWeight.medium,
  },
  userCardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.auth.cardBorder,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  interactionText: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  jobDescriptionText: {
    fontSize: typography.fontSize.base,
    color: colors.auth.textTertiary,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(253, 254, 255, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    elevation: 8,
    shadowColor: colors.auth.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.auth.text,
  },
  modalAuthor: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    marginBottom: spacing.sm,
  },
  modalUserDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.text,
    marginBottom: spacing.xs,
  },
  modalPostActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  likeButton: {
    backgroundColor: colors.auth.cardBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
  },
  likedButton: {
    backgroundColor: '#ffe5e5',
    borderColor: colors.error,
  },
  likeButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
  },
  likedText: {
    color: colors.error,
  },
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.auth.cardBorder,
    paddingTop: spacing.md,
  },
  commentsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
    marginBottom: spacing.md,
  },
  commentItem: {
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
  },
  commentAuthor: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
    marginBottom: spacing.xs,
  },
  commentContent: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    marginBottom: spacing.xs,
  },
  commentDate: {
    fontSize: typography.fontSize.xs,
    color: colors.auth.textTertiary,
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.auth.text,
    fontSize: typography.fontSize.sm,
    borderWidth: 1,
    borderColor: colors.auth.inputBorder,
  },
  commentSend: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
  },
  commentSendText: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.sm,
  },
  modalClose: {
    paddingVertical: spacing.sm,
    alignItems: 'flex-end',
  },
  modalCloseText: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 8,
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  modalScroll: {
    maxHeight: '90%',
    width: '100%',
    maxWidth: 500,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarText: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.auth.cardBorder,
    marginVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: colors.auth.cardBg,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    textAlign: 'center',
  },
  sectionTitleMaicard: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: "#0550d1e3",
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    textAlign: 'center',
  },
  detailText: {
    fontSize: typography.fontSize.base,
    color: colors.auth.text,
    marginBottom: spacing.xs,
    lineHeight: 22,
    padding: 5,
  },
  descriptionText: {
    fontSize: typography.fontSize.base,
    color: colors.auth.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  linkButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  linkButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
