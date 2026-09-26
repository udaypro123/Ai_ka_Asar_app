import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { updateProfile } from '../../src/store/slices/authSlice';
import { postService, commentService, likeService } from '../../src/services/social.service';
import { userService } from '../../src/services/user.service';
import { Post, Comment } from '../../src/types';
import { borderRadius, colors, spacing, typography } from '@/theme';
import { GradientScrollView } from '@/components/common/BackgroundGradient';
import { useToast } from '@/components/common/Toast';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { openExternalUrl } from '../../src/utils/externalLinks';

export default function HomeScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const toast = useToast();
  const router = useRouter();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    currentRole: user?.currentRole || '',
    previousRole: user?.previousRole || '',
    previousCompany: user?.previousCompany || '',
    company: user?.company || '',
    jobDescription: user?.jobDescription || '',
    skills: user?.skills?.join(', ') || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('AI Impact');
  const [savingPost, setSavingPost] = useState(false);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  }, []);

  useEffect(() => {
    if (user?.resume) {
      setResumeName(user.resume.split('/').pop() || 'Resume uploaded');
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = await userService.getProfile();
      setProfile({
        name: data.name || '',
        email: data.email || '',
        mobile: data.mobile || '',
        currentRole: data.currentRole || '',
        previousRole: data.previousRole || '',
        previousCompany: data.previousCompany || '',
        company: data.company || '',
        jobDescription: data.jobDescription || '',
        skills: data.skills?.join(', ') || '',
        linkedinUrl: data.linkedinUrl || '',
        githubUrl: data.githubUrl || '',
      });
      if (data.resume) {
        setResumeName(data.resume.split('/').pop() || 'Resume uploaded');
      }
    } catch (error) {
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const isProfileComplete = useMemo(() => {
    return !!(
      profile.currentRole &&
      profile.company &&
      profile.skills &&
      profile.mobile
    );
  }, [profile]);

  const loadMyPosts = async () => {
    setLoadingPosts(true);
    try {
      const data = await postService.getMyPosts();
      setPosts(data);
    } catch (error) {
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadMyPosts();
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const skillsArray = profile.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      await dispatch(
        updateProfile({
          name: profile.name,
          email: profile.email,
          mobile: profile.mobile,
          currentRole: profile.currentRole,
          previousRole: profile.previousRole,
          previousCompany: profile.previousCompany,
          company: profile.company,
          jobDescription: profile.jobDescription,
          skills: skillsArray,
          linkedinUrl: profile.linkedinUrl.trim() ? profile.linkedinUrl.trim() : undefined,
          githubUrl: profile.githubUrl.trim() ? profile.githubUrl.trim() : undefined,
        } as any)
      ).unwrap();
      toast.showToast('Profile updated', 'success');
      fetchProfile();
    } catch (error) {
      toast.showToast('Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResumePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });
      if (!result.canceled && result.assets?.[0]) {
        setUploading(true);
        try {
          await userService.uploadResume({
            uri: result.assets[0].uri,
            name: result.assets[0].name,
            type: result.assets[0].mimeType || 'application/pdf',
          } as any);
          setResumeName(result.assets[0].name);
          toast.showToast('Resume uploaded', 'success');
        } catch {
          toast.showToast('Failed to upload resume', 'error');
        } finally {
          setUploading(false);
        }
      }
    } catch {
      toast.showToast('Failed to pick document', 'error');
    }
  };

  const handleImpactPress = () => {
    router.push('/(tabs)/profile');
  };

  const openCreateThought = () => {
    if (posts.length > 0) {
      toast.showToast('You have already shared your AI impact thought', 'error');
      return;
    }
    setEditingPost(null);
    setPostTitle('My AI Impact Thought');
    setPostContent('');
    setPostCategory('AI Impact');
    setShowPostModal(true);
  };

  const openEditThought = (post: Post) => {
    setEditingPost(post);
    setPostTitle(post.title);
    setPostContent(post.content);
    setPostCategory(post.category || 'AI Impact');
    setShowPostModal(true);
  };

  const handleSavePost = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      toast.showToast('Title and content are required', 'error');
      return;
    }

    setSavingPost(true);
    try {
      if (editingPost) {
        await postService.updatePost(editingPost._id, {
          title: postTitle,
          content: postContent,
          category: postCategory,
        });
        toast.showToast('Thought updated', 'success');
      } else {
        await postService.createPost({
          title: postTitle,
          content: postContent,
          category: postCategory,
        });
        toast.showToast('Thought shared', 'success');
      }
      setShowPostModal(false);
      loadMyPosts();
    } catch (error) {
      toast.showToast('Failed to save thought', 'error');
    } finally {
      setSavingPost(false);
    }
  };

  const openPostDetail = async (post: Post) => {
    setSelectedPost(post);
    setLoadingComments(true);
    try {
      const data = await commentService.getComments(post._id);
      setComments(data);
    } catch (error) {
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
      loadMyPosts();
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
      loadMyPosts();
    } catch (error) {
      toast.showToast('Failed to add comment', 'error');
    }
  };

  const isLiked = (post: Post) => {
    return post.likes.includes(user?._id || '');
  };

  const isHR = user?.roles?.includes('HR');

  return (
    <GradientScrollView contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>{greeting}, {user?.name?.split(' ')?.[0] || 'User'}</Text>

      {loadingProfile && (
        <View style={styles.loadingRow}>
          <Text style={styles.loadingText}>Refreshing profile...</Text>
        </View>
      )}

      <View style={styles.resumeCard}>
        <View style={styles.resumeHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.resumeHeaderText}>
            <Text style={styles.resumeName}>{profile.name || 'User'}</Text>
            <Text style={styles.resumeRole}>{profile.currentRole || 'No role set'}{profile.company ? ` at ${profile.company}` : ''}</Text>
            <Text style={styles.resumeContact}>{profile.email} {profile.mobile ? `| ${profile.mobile}` : ''}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {profile.previousRole || profile.previousCompany ? (
          <>
            <Text style={styles.sectionLabel}>Previous Experience</Text>
            <Text style={styles.sectionValue}>
              {profile.previousRole || ''}{profile.previousRole && profile.previousCompany ? ' at ' : ''}{profile.previousCompany || ''}
            </Text>
          </>
        ) : null}

        <Text style={styles.sectionLabel}>About</Text>
        <Text style={styles.sectionValue}>{profile.jobDescription || 'No description provided'}</Text>

        <Text style={styles.sectionLabel}>Skills</Text>
        <View style={styles.skillsContainer}>
          {profile.skills ? (
            profile.skills.split(',').map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill.trim()}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.sectionValue}>No skills added</Text>
          )}
        </View>

        {(profile.linkedinUrl || profile.githubUrl) && (
          <>
            <Text style={styles.sectionLabel}>Profiles</Text>
            <View style={styles.linksRow}>
              {profile.linkedinUrl ? (
                <Pressable style={styles.linkButton} onPress={() => void openExternalUrl(profile.linkedinUrl)}>
                  <Text style={styles.linkButtonText}>LinkedIn</Text>
                </Pressable>
              ) : null}
              {profile.githubUrl ? (
                <Pressable style={styles.linkButton} onPress={() => void openExternalUrl(profile.githubUrl)}>
                  <Text style={styles.linkButtonText}>GitHub</Text>
                </Pressable>
              ) : null}
            </View>
          </>
        )}

        {resumeName && (
          <>
            <Text style={styles.sectionLabel}>Resume</Text>
            <Pressable style={styles.resumeButton} onPress={() => {}}>
              <Text style={styles.resumeButtonText}>Resume Attached: {resumeName}</Text>
            </Pressable>
          </>
        )}
      </View>

      <Pressable style={styles.impactButton} onPress={handleImpactPress}>
        <Text style={styles.impactButtonText}>Add Impact</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>My AI Impact Thought</Text>
      {posts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>You haven't shared your AI impact thought yet.</Text>
          <Pressable style={styles.cardButton} onPress={openCreateThought}>
            <Text style={styles.cardButtonText}>Share Your AI Impact Thought</Text>
          </Pressable>
        </View>
      ) : (
        posts.slice(0, 1).map((post) => (
          <Pressable key={post._id} style={styles.postCard} onPress={() => openPostDetail(post)}>
            <View style={styles.postHeader}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <View style={styles.postActions}>
                <Pressable onPress={() => openEditThought(post)}>
                  <Text style={styles.actionText}>Edit</Text>
                </Pressable>
              </View>
            </View>
            <Text style={styles.postContent} numberOfLines={4}>{post.content}</Text>
            <View style={styles.postFooter}>
              <Text style={styles.postMeta}>❤️ {post.likes.length} likes</Text>
              <Text style={styles.postMeta}>💬 {post.commentCount} comments</Text>
            </View>
          </Pressable>
        ))
      )}

      <Modal visible={showPostModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingPost ? 'Edit Thought' : 'Share Your AI Impact Thought'}</Text>
            <TextInput
              style={styles.modalInput}
              value={postTitle}
              onChangeText={setPostTitle}
              placeholder="Thought title"
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={postContent}
              onChangeText={setPostContent}
              placeholder="Share how AI has impacted your career..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setShowPostModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={handleSavePost} disabled={savingPost}>
                <Text style={styles.modalSaveText}>{savingPost ? 'Saving...' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedPost} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPost && (
              <>
                <Text style={styles.modalTitle}>{selectedPost.title}</Text>
                {selectedPost.user && (
                  <View style={styles.modalUserInfo}>
                    <Text style={styles.modalUserName}>{selectedPost.user.name}</Text>
                    {selectedPost.user.currentRole && (
                      <Text style={styles.modalUserDetail}>Current Role: {selectedPost.user.currentRole}</Text>
                    )}
                    {selectedPost.user.previousRole && (
                      <Text style={styles.modalUserDetail}>Previous Role: {selectedPost.user.previousRole}</Text>
                    )}
                    {selectedPost.user.company && (
                      <Text style={styles.modalUserDetail}>Company: {selectedPost.user.company}</Text>
                    )}
                    {selectedPost.user.skills && selectedPost.user.skills.length > 0 && (
                      <Text style={styles.modalUserDetail}>Skills: {selectedPost.user.skills.join(', ')}</Text>
                    )}
                  </View>
                )}
                <Text style={styles.modalPostContent}>{selectedPost.content}</Text>
                {isHR && selectedPost.user && (
                  <Pressable
                    style={styles.contactButton}
                    onPress={() => {
                      if (selectedPost.user?.mobile) {
                        Alert.alert('Contact User', `Mobile: ${selectedPost.user.mobile}`);
                      } else {
                        Alert.alert('Contact', 'Mobile number not available');
                      }
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
                    <Text >Loading comments...</Text>
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
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.auth.text,
    marginBottom: spacing.lg,
  },
  impactButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  impactButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  loadingRow: {
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
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
  profileRow: {
    marginBottom: spacing.md,
  },
  profileLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.auth.text,
    marginBottom: spacing.xs,
  },
  profileInput: {
    backgroundColor: colors.auth.inputBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.auth.text,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
    borderColor: colors.auth.inputBorder,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  fileName: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyCard: {
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.auth.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  cardButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cardButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  postTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
  },
  postActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  deleteText: {
    color: colors.error,
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
    backgroundColor: 'rgba(19, 0, 223, 0.72)',
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
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.auth.inputBg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    color: colors.auth.text,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
    borderColor: colors.auth.inputBorder,
    marginBottom: spacing.md,
  },
  modalTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalCancel: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  modalCancelText: {
    color: colors.auth.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  modalSave: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  modalSaveText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  modalUserInfo: {
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
  },
  modalUserName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.text,
    marginBottom: spacing.xs,
  },
  modalUserDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
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
  resumeCard: {
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
    marginBottom: spacing.lg,
  },
  resumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  resumeHeaderText: {
    flex: 1,
  },
  resumeName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.auth.text,
    marginBottom: spacing.xs,
  },
  resumeRole: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  resumeContact: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.auth.cardBorder,
    marginVertical: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionValue: {
    fontSize: typography.fontSize.base,
    color: colors.auth.text,
    lineHeight: 22,
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
  linksRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  linkButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  linkButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  resumeButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resumeButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
