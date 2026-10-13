import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppSelector } from '../../store/hooks';
import {
  userCommentService,
  userLikeService,
} from '../../services/social.service';
import type { UserComment } from '../../types';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { usePageRefresh } from './PageRefresh';
import { useToast } from './Toast';
import { getApiErrorMessage } from '../../utils/apiError';
import { ThreadedComments } from './ThreadedComments';
import { AimargLoader } from './AimargLoader';

export function ProfileInteractions({ refreshKey = 0 }: { refreshKey?: number }) {
  const { user } = useAppSelector((state) => state.auth);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTarget, setReplyTarget] = useState<UserComment | null>(null);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { showToast } = useToast();

  const loadInteractions = useCallback(async () => {
    if (!user?._id) {
      setLikeCount(0);
      setComments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [summaryResult, commentsResult] = await Promise.allSettled([
      userLikeService.getInteractionSummary(),
      userCommentService.getUserComments(user._id),
    ]);
    const errors: unknown[] = [];
    if (summaryResult.status === 'fulfilled') {
      const ownSummary = summaryResult.value.find(
        (summary) => summary.targetUserId === user._id
      );
      setLikeCount(ownSummary?.likeCount ?? 0);
    } else {
      errors.push(summaryResult.reason);
    }
    if (commentsResult.status === 'fulfilled') {
      setComments(commentsResult.value);
    } else {
      errors.push(commentsResult.reason);
    }
    if (errors.length > 0) {
      showToast(getApiErrorMessage(errors[0], 'Could not load your profile activity.'), 'error');
    }
    setLoading(false);
  }, [showToast, user?._id]);

  useFocusEffect(
    useCallback(() => {
      loadInteractions();
    }, [loadInteractions])
  );
  usePageRefresh(loadInteractions);

  useEffect(() => {
    if (refreshKey > 0) loadInteractions();
  }, [loadInteractions, refreshKey]);

  const addComment = async () => {
    const content = commentText.trim();
    if (!user?._id || !content || sending) return;
    setSending(true);
    try {
      const comment = await userCommentService.createUserComment({
        targetUserId: user._id,
        content,
        ...(replyTarget ? { parentCommentId: replyTarget._id } : {}),
      });
      setComments((current) => [comment, ...current]);
      setCommentText('');
      setReplyTarget(null);
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Could not post your comment.'), 'error');
    } finally {
      setSending(false);
    }
  };

  const openActivity = () => {
    setShowComments(true);
    loadInteractions();
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Profile likes & comments</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${likeCount} profile likes and ${comments.length} comments. Open activity`}
        style={styles.card}
        onPress={openActivity}
      >
        <Text style={styles.counts}>❤️ {likeCount} likes  ·  💬 {comments.length} comments</Text>
        <Text style={styles.infoText}>{loading ? 'Loading activity...' : 'Tap to view comments and reply'}</Text>
      </Pressable>

      <Modal
        visible={showComments}
        animationType="slide"
        transparent
        onRequestClose={() => setShowComments(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={styles.modalKeyboard}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalCard}>
              <Pressable style={styles.closeButton} onPress={() => setShowComments(false)}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.modalTitle}>Profile likes & comments</Text>
                <Text style={styles.counts}>❤️ {likeCount} likes  ·  💬 {comments.length} comments</Text>
                <View style={styles.commentInputRow}>
                  <TextInput
                    style={styles.input}
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder={replyTarget ? 'Write a reply...' : 'Add a comment...'}
                    maxLength={500}
                    multiline
                  />
                  <Pressable
                    style={[styles.sendButton, (!commentText.trim() || sending) && styles.disabled]}
                    onPress={addComment}
                    disabled={!commentText.trim() || sending}
                  >
                    <Text style={styles.sendText}>{sending ? '...' : 'Post'}</Text>
                  </Pressable>
                </View>
                <View style={styles.commentsSection}>
                  <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
                  {loading ? (
                    <AimargLoader compact message="Loading comments" />
                  ) : comments.length === 0 ? (
                    <Text style={styles.infoText}>No comments yet. Be the first to comment.</Text>
                  ) : (
                    <ThreadedComments comments={comments} onReply={setReplyTarget} />
                  )}
                </View>
                {replyTarget && (
                  <View style={styles.composerHeader}>
                    <Text style={styles.infoText}>Replying to {replyTarget.userName}</Text>
                    <Pressable onPress={() => setReplyTarget(null)}>
                      <Text style={styles.cancelReply}>Cancel</Text>
                    </Pressable>
                  </View>
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.auth.text,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    cursor: 'pointer',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl * 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalKeyboard: {
    width: '100%',
    maxWidth: 520,
    height: '85%',
  },
  modalScroll: {
    flex: 1,
    width: '100%',
  },
  modalCard: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    overflow: 'hidden',
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalTitle: {
    color: colors.auth.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.auth.cardBorder,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  closeButton: {
    alignItems: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  closeText: {
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  commentsTitle: {
    color: colors.auth.text,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  counts: {
    color: colors.auth.text,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  infoText: {
    color: colors.auth.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  composerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.auth.cardBorder,
    paddingTop: spacing.md,
    marginBottom: spacing.xs,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelReply: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.auth.inputBorder,
    borderRadius: borderRadius.md,
    color: colors.auth.text,
    backgroundColor: colors.white,
  },
  sendButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  sendText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
