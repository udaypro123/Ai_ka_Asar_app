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
  type UserInteractionSummary,
} from '../../services/social.service';
import type { UserComment } from '../../types';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { usePageRefresh } from './PageRefresh';
import { useToast } from './Toast';
import { getApiErrorMessage } from '../../utils/apiError';
import { ThreadedComments } from './ThreadedComments';

export function ProfileInteractions({ refreshKey = 0 }: { refreshKey?: number }) {
  const { user } = useAppSelector((state) => state.auth);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTarget, setReplyTarget] = useState<UserComment | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { showToast } = useToast();

  const loadInteractions = useCallback(async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    try {
      const [summaries, latestComments] = await Promise.all([
        userLikeService.getInteractionSummary(),
        userCommentService.getUserComments(user._id),
      ]);
      const ownSummary = (summaries as UserInteractionSummary[]).find(
        (summary) => summary.targetUserId === user._id
      );
      setLikeCount(ownSummary?.likeCount ?? 0);
      setComments(latestComments);
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Could not load your profile activity.'), 'error');
    } finally {
      setLoading(false);
    }
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

  const sendReply = async () => {
    const content = replyText.trim();
    if (!user?._id || !replyTarget || !content || sending) return;
    setSending(true);
    try {
      const reply = await userCommentService.createUserComment({
        targetUserId: user._id,
        content,
        parentCommentId: replyTarget._id,
      });
      setComments((current) => [reply, ...current]);
      setReplyText('');
      setReplyTarget(null);
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Could not send your reply.'), 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Profile likes & comments</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${likeCount} profile likes and ${comments.length} comments. Open activity`}
        style={styles.card}
        onPress={() => setShowComments(true)}
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
              <Text style={styles.modalTitle}>Profile activity</Text>
              <Text style={styles.counts}>❤️ {likeCount} likes  ·  💬 {comments.length} comments</Text>
              <ScrollView style={styles.commentsList} keyboardShouldPersistTaps="handled">
                {loading ? (
                  <Text style={styles.infoText}>Loading comments...</Text>
                ) : comments.length === 0 ? (
                  <Text style={styles.infoText}>No comments yet.</Text>
                ) : (
                  <ThreadedComments comments={comments} onReply={setReplyTarget} />
                )}
              </ScrollView>
              {replyTarget && (
                <View style={styles.composerHeader}>
                  <Text style={styles.infoText}>Replying to {replyTarget.userName}</Text>
                  <Pressable onPress={() => setReplyTarget(null)}>
                    <Text style={styles.cancelReply}>Cancel</Text>
                  </Pressable>
                </View>
              )}
              {replyTarget && (
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={replyText}
                    onChangeText={setReplyText}
                    placeholder="Write a reply..."
                    maxLength={500}
                    multiline
                  />
                  <Pressable
                    style={[styles.sendButton, (!replyText.trim() || sending) && styles.disabled]}
                    onPress={sendReply}
                    disabled={!replyText.trim() || sending}
                  >
                    <Text style={styles.sendText}>{sending ? '...' : 'Send'}</Text>
                  </Pressable>
                </View>
              )}
              <Pressable style={styles.closeButton} onPress={() => setShowComments(false)}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalKeyboard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
  },
  modalCard: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
  },
  modalTitle: {
    color: colors.auth.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  commentsList: {
    flexGrow: 0,
    maxHeight: 480,
    marginVertical: spacing.md,
  },
  closeButton: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  closeText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
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
  cancelReply: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
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
