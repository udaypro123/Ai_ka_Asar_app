import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { userCommentService, userLikeService } from '../../services/social.service';
import { User } from '../../types';
import { openExternalUrl } from '../../utils/externalLinks';

export interface UserWithInteractions extends User {
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

interface CommunityUserModalProps {
  user: UserWithInteractions;
  currentUserId?: string;
  onClose: () => void;
  onInteractionChange: (userId: string, interaction: Pick<UserWithInteractions, 'likeCount' | 'commentCount' | 'likedByMe'>) => void;
}

interface ProfileDetailProps {
  label: string;
  value?: string;
}

function ProfileDetail({ label, value }: ProfileDetailProps) {
  if (!value) return null;
  return (
    <Text style={styles.detailText}>
      <Text style={styles.detailsLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

export function CommunityUserModal({ user, currentUserId, onClose, onInteractionChange }: CommunityUserModalProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingLike, setUpdatingLike] = useState(false);
  const [likeCount, setLikeCount] = useState(user.likeCount);
  const [commentCount, setCommentCount] = useState(user.commentCount);
  const [likedByMe, setLikedByMe] = useState(user.likedByMe);

  useEffect(() => {
    let isCurrentSelection = true;
    userCommentService.getUserComments(user._id)
      .then((latestComments) => {
        if (isCurrentSelection) {
          setComments(latestComments);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (isCurrentSelection) setLoadingComments(false);
      });

    return () => {
      isCurrentSelection = false;
    };
  }, [user._id]);

  const handleLike = async () => {
    if (updatingLike) return;
    setUpdatingLike(true);
    try {
      const result = await userLikeService.toggleUserLike(currentUserId || '', user._id);
      const nextLikeCount = Math.max(0, likeCount + (result.liked ? 1 : -1));
      setLikeCount(nextLikeCount);
      setLikedByMe(result.liked);
      onInteractionChange(user._id, { likeCount: nextLikeCount, commentCount, likedByMe: result.liked });
    } catch {
      Alert.alert('Like failed', 'Could not update this like. Please try again.');
    } finally {
      setUpdatingLike(false);
    }
  };

  const handleAddComment = async () => {
    const content = commentText.trim();
    if (!content || submittingComment) return;
    setSubmittingComment(true);
    try {
      const comment = await userCommentService.createUserComment({ targetUserId: user._id, content });
      const nextCommentCount = commentCount + 1;
      setComments((previousComments) => [comment, ...previousComments]);
      setCommentText('');
      setCommentCount(nextCommentCount);
      onInteractionChange(user._id, { likeCount, commentCount: nextCommentCount, likedByMe });
    } catch {
      Alert.alert('Comment failed', 'Could not add your comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
          <Pressable style={styles.modalClose} onPress={onClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </Pressable>

          <View style={styles.modalHeader}>
            <View style={styles.modalAvatar}>
              <Text style={styles.modalAvatarText}>{user.name?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
            <Text style={styles.modalTitle}>{user.name}</Text>
            <Text style={styles.modalAuthor}>
              {user.currentRole || user.roles?.[0] || 'USER'}{user.company ? ` at ${user.company}` : ''}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Contact</Text>
          <ProfileDetail label="Email" value={user.email} />
          <ProfileDetail label="Mobile" value={user.mobile} />

          <Text style={styles.sectionTitle}>Professional Details</Text>
          <ProfileDetail label="Current Role" value={user.currentRole} />
          <ProfileDetail label="Previous Role" value={user.previousRole} />
          <ProfileDetail label="Current Company" value={user.company} />
          <ProfileDetail label="Previous Company" value={user.previousCompany} />
          <ProfileDetail label="Employment Status" value={user.employmentStatus} />
          <ProfileDetail label="Experience" value={user.experience} />
          <ProfileDetail label="Profession" value={user.profession} />
          <ProfileDetail label="Industry" value={user.industry} />

          {user.jobDescription && (
            <>
              <Text style={styles.sectionTitle}>Job Description</Text>
              <Text style={styles.descriptionText}>{user.jobDescription}</Text>
            </>
          )}

          {user.skills && user.skills.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsContainer}>
                {user.skills.map((skill, index) => (
                  <View key={`${user._id}-${skill}-${index}`} style={styles.skillBadge}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {(user.linkedinUrl || user.githubUrl) && (
            <>
              <Text style={styles.sectionTitle}>Profiles</Text>
              {user.linkedinUrl && (
                <Pressable style={styles.linkButton} onPress={() => void openExternalUrl(user.linkedinUrl)}>
                  <Text style={styles.linkButtonText}>LinkedIn Profile</Text>
                </Pressable>
              )}
              {user.githubUrl && (
                <Pressable style={styles.linkButton} onPress={() => void openExternalUrl(user.githubUrl)}>
                  <Text style={styles.linkButtonText}>GitHub Profile</Text>
                </Pressable>
              )}
            </>
          )}

          <View style={styles.modalPostActions}>
            <Pressable
              disabled={updatingLike}
              style={[styles.likeButton, likedByMe && styles.likedButton]}
              onPress={() => void handleLike()}
            >
              <Text style={[styles.likeButtonText, likedByMe && styles.likedText]}>
                {likedByMe ? '❤️' : '🤍'} {likeCount}
              </Text>
            </Pressable>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments ({commentCount})</Text>
            {loadingComments ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              comments.map((comment) => (
                <View key={comment._id} style={styles.commentItem}>
                  <Text style={styles.commentAuthor}>{comment.userName}</Text>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                  <Text style={styles.commentDate}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
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
              <Pressable
                disabled={submittingComment || !commentText.trim()}
                style={[styles.commentSend, (submittingComment || !commentText.trim()) && styles.commentSendDisabled]}
                onPress={() => void handleAddComment()}
              >
                <Text style={styles.commentSendText}>{submittingComment ? 'Posting...' : 'Post'}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(253, 254, 255, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalScroll: {
    maxHeight: '90%',
    width: '100%',
    maxWidth: 500,
  },
  modalContent: {
    backgroundColor: colors.white,
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
  modalClose: {
    paddingVertical: spacing.sm,
    alignItems: 'flex-end',
  },
  modalCloseText: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
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
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: colors.auth.cardBg,
    textTransform: 'uppercase',
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    textAlign: 'center',
  },
  detailText: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.text,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  detailsLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
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
  commentSendDisabled: {
    opacity: 0.55,
  },
  commentSendText: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.sm,
  },
});