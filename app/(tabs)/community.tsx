import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal, Alert, TextInput, Linking } from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import { useAppSelector } from '../../src/store/hooks';
import { adminService, userLikeService, userCommentService } from '../../src/services/social.service';
import { User } from '../../src/types';
import { borderRadius, colors, spacing, typography } from '../../src/theme';
import { GradientScrollView } from '../../src/components/common/BackgroundGradient';
import { useToast } from '../../src/components/common/Toast';

interface UserWithMeta extends User {
  likes?: string[];
  comments?: any[];
  likedByMe?: boolean;
}

export default function CommunityScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<UserWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithMeta | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const toast = useToast();

  const currentUserId = user?._id;

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers();
      const filtered = (data || []).filter((u) => u._id !== currentUserId && !u.roles?.includes('ADMIN') && !u.roles?.includes('SUPER_ADMIN'));
      const usersWithMeta: UserWithMeta[] = filtered.map((u) => ({
        ...u,
        likes: [],
        comments: [],
        likedByMe: false,
      }));
      setUsers(usersWithMeta);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserMeta = async (targetUserId: string) => {
    try {
      const [likesRes, commentsRes] = await Promise.all([
        userLikeService.getUserLikes(targetUserId),
        userCommentService.getUserComments(targetUserId),
      ]);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUserId
            ? { ...u, likes: likesRes, likedByMe: likesRes.includes(currentUserId || '') }
            : u
        )
      );
      if (selectedUser?._id === targetUserId) {
        setComments(commentsRes);
      }
    } catch (error) {
      console.error('Failed to load user meta:', error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openUser = async (targetUser: UserWithMeta) => {
    setSelectedUser(targetUser);
    setLoadingComments(true);
    setCommentText('');
    try {
      const [likesRes, commentsRes] = await Promise.all([
        userLikeService.getUserLikes(targetUser._id),
        userCommentService.getUserComments(targetUser._id),
      ]);
      setComments(commentsRes);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUser._id
            ? { ...u, likes: likesRes, likedByMe: likesRes.includes(currentUserId || '') }
            : u
        )
      );
    } catch (error) {
      console.error('Failed to load user details:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async (targetUserId: string) => {
    try {
      const result = await userLikeService.toggleUserLike(currentUserId || '', targetUserId);
      const updatedLikes = result.liked
        ? [...(users.find((u) => u._id === targetUserId)?.likes || []), currentUserId || '']
        : (users.find((u) => u._id === targetUserId)?.likes || []).filter((id) => id !== currentUserId);

      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUserId
            ? { ...u, likes: updatedLikes, likedByMe: result.liked }
            : u
        )
      );

      if (selectedUser?._id === targetUserId) {
        setSelectedUser((prev) => (prev ? { ...prev, likedByMe: result.liked, likes: updatedLikes } : prev));
      }
    } catch (error) {
      console.error('Like failed:', error);
      toast.showToast('Failed to update like', 'error');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedUser) return;
    try {
      const comment = await userCommentService.createUserComment({
        targetUserId: selectedUser._id,
        content: commentText.trim(),
      });
      setCommentText('');
      setComments((prev) => [comment, ...prev]);
      toast.showToast('Comment added', 'success');
    } catch (error) {
      console.error('Comment failed:', error);
      toast.showToast('Failed to add comment', 'error');
    }
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

              <View style={styles.userCardFooter}>
                <View style={styles.userDetailRow}>
                  <Text style={styles.interactionText}>
                    ❤️ {u.likes?.length || 0} likes
                  </Text>
                  <Text style={styles.interactionText}>
                    💬 {u.comments?.length || 0} comments
                  </Text>
                </View>
                {(u.jobDescription) && (
                  <Text style={styles.jobDescriptionText} numberOfLines={2}>
                    {u.jobDescription}
                  </Text>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <Modal visible={!!selectedUser} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>
                      {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <Text style={styles.modalTitle}>{selectedUser.name}</Text>
                  <Text style={styles.modalAuthor}>
                    {selectedUser.currentRole || selectedUser.roles[0] || 'USER'}
                    {selectedUser.company ? ` at ${selectedUser.company}` : ''}
                  </Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Contact</Text>
                {selectedUser.email && (
                  <Text style={styles.detailText}>Email: {selectedUser.email}</Text>
                )}
                {selectedUser.mobile && (
                  <Text style={styles.detailText}>Mobile: {selectedUser.mobile}</Text>
                )}

                <Text style={styles.sectionTitle}>Professional Details</Text>
                {selectedUser.currentRole && (
                  <Text style={styles.detailText}>Current Role: {selectedUser.currentRole}</Text>
                )}
                {selectedUser.previousRole && (
                  <Text style={styles.detailText}>Previous Role: {selectedUser.previousRole}</Text>
                )}
                {selectedUser.company && (
                  <Text style={styles.detailText}>Current Company: {selectedUser.company}</Text>
                )}
                {selectedUser.previousCompany && (
                  <Text style={styles.detailText}>Previous Company: {selectedUser.previousCompany}</Text>
                )}
                {selectedUser.employmentStatus && (
                  <Text style={styles.detailText}>Employment Status: {selectedUser.employmentStatus}</Text>
                )}
                {selectedUser.experience && (
                  <Text style={styles.detailText}>Experience: {selectedUser.experience}</Text>
                )}
                {selectedUser.profession && (
                  <Text style={styles.detailText}>Profession: {selectedUser.profession}</Text>
                )}
                {selectedUser.industry && (
                  <Text style={styles.detailText}>Industry: {selectedUser.industry}</Text>
                )}

                {selectedUser.jobDescription && (
                  <>
                    <Text style={styles.sectionTitle}>Job Description</Text>
                    <Text style={styles.descriptionText}>{selectedUser.jobDescription}</Text>
                  </>
                )}

                {selectedUser.skills && selectedUser.skills.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <View style={styles.skillsContainer}>
                      {selectedUser.skills.map((skill, index) => (
                        <View key={index} style={styles.skillBadge}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {(selectedUser.linkedinUrl || selectedUser.githubUrl) && (
                  <>
                    <Text style={styles.sectionTitle}>Profiles</Text>
                    {selectedUser.linkedinUrl && (
                      <Pressable style={styles.linkButton} onPress={() => Linking.openURL(selectedUser.linkedinUrl.startsWith('http') ? selectedUser.linkedinUrl : `https://${selectedUser.linkedinUrl}`)}>
                        <Text style={styles.linkButtonText}>LinkedIn Profile</Text>
                      </Pressable>
                    )}
                    {selectedUser.githubUrl && (
                      <Pressable style={styles.linkButton} onPress={() => Linking.openURL(selectedUser.githubUrl.startsWith('http') ? selectedUser.githubUrl : `https://${selectedUser.githubUrl}`)}>
                        <Text style={styles.linkButtonText}>GitHub Profile</Text>
                      </Pressable>
                    )}
                  </>
                )}

                <View style={styles.modalPostActions}>
                  <Pressable
                    style={[styles.likeButton, selectedUser.likedByMe && styles.likedButton]}
                    onPress={() => handleLike(selectedUser._id)}
                  >
                    <Text style={[styles.likeButtonText, selectedUser.likedByMe && styles.likedText]}>
                      {selectedUser.likedByMe ? '❤️' : '🤍'} {selectedUser.likes?.length || 0}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.commentsSection}>
                  <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
                  {loadingComments ? (
                    <Text style={styles.loadingText}>Loading comments...</Text>
                  ) : (
                    comments.map((comment) => (
                      <View key={comment._id} style={styles.commentItem}>
                        <Text style={styles.commentAuthor}>{comment.userName}</Text>
                        <Text style={styles.commentContent}>{comment.content}</Text>
                        <Text style={styles.commentDate}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    ))
                  )}
                  <View style={styles.commentInputRow}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Add a comment..."
                      value={commentText}
                      onChangeText={setCommentText}
                    />
                    <Pressable style={styles.commentSend} onPress={handleAddComment}>
                      <Text style={styles.commentSendText}>Post</Text>
                    </Pressable>
                  </View>
                </View>

                <Pressable style={styles.modalClose} onPress={() => setSelectedUser(null)}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
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
    fontSize: typography.fontSize.xs,
    color: colors.auth.textTertiary,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(50, 24, 246, 0.73)',
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
    marginBottom: spacing.sm,
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
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  modalCloseText: {
    color: colors.auth.textSecondary,
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
    marginBottom: spacing.md,
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
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailText: {
    fontSize: typography.fontSize.base,
    color: colors.auth.text,
    marginBottom: spacing.xs,
    lineHeight: 22,
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
