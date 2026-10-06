import { useCallback, useEffect, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { usePageRefresh } from './PageRefresh';
import { useToast } from './Toast';
import { commentService, postService } from '../../services/social.service';
import type { Comment, Post } from '../../types';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { getApiErrorMessage } from '../../utils/apiError';
import { ThreadedComments } from './ThreadedComments';

interface MyPostActivityProps {
  refreshKey?: number;
}

export function MyPostActivity({ refreshKey = 0 }: MyPostActivityProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const { showToast } = useToast();

  const loadPosts = useCallback(async () => {
    try {
      setPosts(await postService.getMyPosts());
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Could not load your post activity.'), 'error');
    } finally {
      setLoadingPosts(false);
    }
  }, [showToast]);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );
  usePageRefresh(loadPosts);

  useEffect(() => {
    if (refreshKey > 0) loadPosts();
  }, [loadPosts, refreshKey]);

  const openPost = async (post: Post) => {
    setSelectedPost(post);
    setReplyTarget(null);
    setCommentText('');
    setLoadingComments(true);
    try {
      setComments(await commentService.getComments(post._id));
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Could not load comments.'), 'error');
    } finally {
      setLoadingComments(false);
    }
  };

  const submitComment = async () => {
    const content = commentText.trim();
    if (!selectedPost || !content || submittingComment) return;

    setSubmittingComment(true);
    try {
      const newComment = await commentService.createComment({
        postId: selectedPost._id,
        content,
        ...(replyTarget ? { parentCommentId: replyTarget._id } : {}),
      });
      const latestPost = { ...selectedPost, commentCount: comments.length + 1 };
      setComments((currentComments) => [newComment, ...currentComments]);
      setSelectedPost(latestPost);
      setPosts((currentPosts) =>
        currentPosts.map((post) => (post._id === latestPost._id ? latestPost : post))
      );
      setCommentText('');
      setReplyTarget(null);
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Could not send your comment.'), 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Your Post Activity</Text>
      {loadingPosts && posts.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>Loading your posts...</Text>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>Your shared posts and their likes or comments will appear here.</Text>
        </View>
      ) : (
        posts.map((post) => (
          <Pressable
            key={post._id}
            style={styles.card}
            onPress={() => {
              openPost(post);
            }}
            accessibilityRole="button"
            accessibilityLabel={`View activity for ${post.title}`}
          >
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>
            <View style={styles.postFooter}>
              <Text style={styles.postMeta}>❤️ {post.likes?.length || 0} likes</Text>
              <Text style={styles.postMeta}>💬 {post.commentCount || 0} comments</Text>
              <Text style={styles.viewComments}>View and reply</Text>
            </View>
          </Pressable>
        ))
      )}

      <Modal
        visible={!!selectedPost}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{selectedPost?.title}</Text>
              <Text style={styles.modalCount}>
                ❤️ {selectedPost?.likes?.length || 0} likes · 💬 {comments.length} comments
              </Text>
              <ScrollView
                style={styles.commentsList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
              >
                {loadingComments ? (
                  <Text style={styles.emptyText}>Loading comments...</Text>
                ) : comments.length === 0 ? (
                  <Text style={styles.emptyText}>No comments yet.</Text>
                ) : (
                  <ThreadedComments comments={comments} onReply={setReplyTarget} />
                )}
              </ScrollView>

              {replyTarget && (
                <View style={styles.replyingRow}>
                  <Text style={styles.replyingLabel}>Replying to {replyTarget.userName}</Text>
                  <Pressable onPress={() => setReplyTarget(null)}>
                    <Text style={styles.cancelReply}>Cancel</Text>
                  </Pressable>
                </View>
              )}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.commentInput}
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder={replyTarget ? 'Write a reply...' : 'Write a comment...'}
                  maxLength={500}
                  multiline
                  editable={!submittingComment}
                />
                <Pressable
                  style={[styles.sendButton, submittingComment && styles.disabledButton]}
                  onPress={() => {
                    submitComment();
                  }}
                  disabled={submittingComment || !commentText.trim()}
                >
                  <Text style={styles.sendButtonText}>{submittingComment ? '...' : 'Send'}</Text>
                </Pressable>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setSelectedPost(null)}>
                <Text style={styles.closeButtonText}>Close</Text>
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
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 4,
    shadowColor: colors.auth.glow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  postTitle: {
    color: colors.auth.text,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  postContent: {
    color: colors.auth.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  postMeta: {
    color: colors.auth.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  viewComments: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyText: {
    color: colors.auth.textSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    padding: spacing.lg,
  },
  modalKeyboard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
  },
  modalCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  modalTitle: {
    color: colors.auth.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  modalCount: {
    color: colors.auth.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  commentsList: {
    maxHeight: 360,
    flexGrow: 0,
    marginBottom: spacing.md,
  },
  commentCard: {
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  replyCard: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
  },
  commentAuthor: {
    color: colors.auth.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  commentContent: {
    color: colors.auth.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  commentDate: {
    color: colors.auth.textTertiary,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.sm,
  },
  replyAction: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  replyingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  replyingLabel: {
    color: colors.auth.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  cancelReply: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  commentInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 44,
    color: colors.auth.text,
    backgroundColor: colors.auth.inputBg,
    borderColor: colors.auth.inputBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.sm,
  },
  sendButton: {
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  closeButton: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  closeButtonText: {
    color: colors.auth.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});
