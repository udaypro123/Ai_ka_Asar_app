import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../src/store/hooks';
import { postService, likeService, commentService } from '../../src/services/social.service';
import { Post, Comment } from '../../src/types';
import { borderRadius, colors, spacing, typography } from '@/theme';
import { GradientScrollView } from '@/components/common/BackgroundGradient';
import { useToast } from '../../src/components/common/Toast';

export default function UsersListScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const toast = useToast();

  const isHR = user?.roles?.includes('HR');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await postService.getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const openPostDetail = async (post: Post) => {
    setSelectedPost(post);
    setLoadingComments(true);
    try {
      const data = await commentService.getComments(post._id);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await likeService.toggleLike(postId);
      if (selectedPost?._id === postId) {
        const updated = await postService.getPostById(postId);
        setSelectedPost(updated);
      }
      loadPosts();
    } catch (error) {
      toast.showToast('Failed to update like', 'error');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedPost) return;
    try {
      await commentService.createComment({
        postId: selectedPost._id,
        content: commentText,
      });
      setCommentText('');
      const data = await commentService.getComments(selectedPost._id);
      setComments(data);
      const updated = await postService.getPostById(selectedPost._id);
      setSelectedPost(updated);
      loadPosts();
    } catch (error) {
      toast.showToast('Failed to add comment', 'error');
    }
  };

  const isLiked = (post: Post) => {
    return post.likes.includes(user?._id || '');
  };

  return (
    <GradientScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Community Posts</Text>
      <Text style={styles.subtitle}>See what other users are sharing about AI impact</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
        </View>
      ) : (
        posts.map((post) => (
          <Pressable key={post._id} style={styles.postCard} onPress={() => openPostDetail(post)}>
            <View style={styles.postHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.postHeaderInfo}>
                <Text style={styles.postAuthor}>{post.user?.name || 'User'}</Text>
                <Text style={styles.postRole}>
                  {post.user?.currentRole || post.user?.roles?.[0] || 'USER'} • {new Date(post.createdAt).toLocaleDateString()}
                </Text>
                {post.user?.company && (
                  <Text style={styles.postCompany}>{post.user.company}</Text>
                )}
                {post.user?.skills && post.user.skills.length > 0 && (
                  <Text style={styles.postSkills}>
                    Skills: {post.user.skills.slice(0, 3).join(', ')}{post.user.skills.length > 3 ? '...' : ''}
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent} numberOfLines={4}>{post.content}</Text>
            <View style={styles.postFooter}>
              <Text style={styles.postMeta}>❤️ {post.likes.length} likes</Text>
              <Text style={styles.postMeta}>💬 {post.commentCount} comments</Text>
            </View>
          </Pressable>
        ))
      )}

      <Modal visible={!!selectedPost} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPost && (
              <>
                <Text style={styles.modalTitle}>{selectedPost.title}</Text>
                <Text style={styles.modalAuthor}>
                  By {selectedPost.user?.name} • {new Date(selectedPost.createdAt).toLocaleDateString()}
                </Text>
                {selectedPost.user?.currentRole && (
                  <Text style={styles.modalUserDetail}>Current Role: {selectedPost.user.currentRole}</Text>
                )}
                {selectedPost.user?.previousRole && (
                  <Text style={styles.modalUserDetail}>Previous Role: {selectedPost.user.previousRole}</Text>
                )}
                {selectedPost.user?.company && (
                  <Text style={styles.modalUserDetail}>Company: {selectedPost.user.company}</Text>
                )}
                {selectedPost.user?.mobile && (
                  <Text style={styles.modalUserDetail}>Mobile: {selectedPost.user.mobile}</Text>
                )}
                {selectedPost.user?.skills && selectedPost.user.skills.length > 0 && (
                  <Text style={styles.modalUserDetail}>
                    Skills: {selectedPost.user.skills.join(', ')}
                  </Text>
                )}
                <Text style={styles.modalPostContent}>{selectedPost.content}</Text>
                {isHR && selectedPost.user?.mobile && (
                  <Pressable
                    style={styles.contactButton}
                    onPress={() => {
                      Alert.alert('Contact User', `Mobile: ${selectedPost.user?.mobile}`);
                    }}
                  >
                    <Text style={styles.contactButtonText}>📞 Contact User</Text>
                  </Pressable>
                )}
                <View style={styles.modalPostActions}>
                  <Pressable style={styles.likeButton} onPress={() => handleLike(selectedPost._id)}>
                    <Text style={[styles.likeButtonText, isLiked(selectedPost) && styles.likedText]}>
                      {isLiked(selectedPost) ? '❤️' : '🤍'} {selectedPost.likes.length}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.commentsSection}>
                  <Text style={styles.commentsTitle}>Comments ({selectedPost.commentCount})</Text>
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

                <Pressable style={styles.modalClose} onPress={() => setSelectedPost(null)}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </Pressable>
              </>
            )}
          </View>
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
  postCard: {
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    elevation: 4,
    shadowColor: colors.auth.glow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
  },
  postRole: {
    fontSize: typography.fontSize.xs,
    color: colors.auth.textSecondary,
    marginTop: 2,
  },
  postCompany: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginTop: 2,
  },
  postSkills: {
    fontSize: typography.fontSize.xs,
    color: colors.auth.textTertiary,
    marginTop: 2,
  },
  postTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
    marginBottom: spacing.sm,
  },
  postContent: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  postFooter: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  postMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.auth.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.auth.bgStart,
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
  modalPostContent: {
    fontSize: typography.fontSize.base,
    color: colors.auth.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  contactButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contactButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  modalPostActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  likeButton: {
    backgroundColor: colors.auth.cardBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
  },
  likeButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
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
    backgroundColor: colors.auth.inputBg,
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
});
