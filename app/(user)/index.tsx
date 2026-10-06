import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { setUserProfile, updateProfile } from '../../src/store/slices/authSlice';
import { postService, commentService, likeService } from '../../src/services/social.service';
import { userService } from '../../src/services/user.service';
import { Post, Comment } from '../../src/types';
import { borderRadius, colors, spacing, typography } from '../../src/theme';
import { GradientScrollView } from '../../src/components/common/BackgroundGradient';
import { useToast } from '../../src/components/common/Toast';
import { useAppRouter as useRouter } from '@/navigation';
import * as DocumentPicker from '../../src/utils/documentPicker';
import { usePageRefresh } from '../../src/components/common/PageRefresh';
import { getApiErrorMessage } from '../../src/utils/apiError';

export default function UserDashboardScreen() {
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
    } catch (error: unknown) {
      toast.showToast(getApiErrorMessage(error, 'Could not load your posts.'), 'error');
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadMyPosts();
  }, []);

  usePageRefresh(async () => {
    const [latestProfile, latestPosts] = await Promise.all([
      userService.getProfile(),
      postService.getMyPosts(),
    ]);
    setProfile({
      name: latestProfile.name || '',
      email: latestProfile.email || '',
      mobile: latestProfile.mobile || '',
      currentRole: latestProfile.currentRole || '',
      previousRole: latestProfile.previousRole || '',
      previousCompany: latestProfile.previousCompany || '',
      company: latestProfile.company || '',
      jobDescription: latestProfile.jobDescription || '',
      skills: latestProfile.skills?.join(', ') || '',
      linkedinUrl: latestProfile.linkedinUrl || '',
      githubUrl: latestProfile.githubUrl || '',
    });
    setResumeName(latestProfile.resume?.split('/').pop() || null);
    setPosts(latestPosts);
    dispatch(setUserProfile(latestProfile));
  });

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
    } catch (error: unknown) {
      toast.showToast(getApiErrorMessage(error, 'Failed to update profile'), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResumePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        if (!/\.(pdf|docx)$/i.test(asset.name)) {
          toast.showToast('Choose a PDF or DOCX file', 'error');
          return;
        }
        setUploading(true);
        try {
          await userService.uploadResume({
            uri: asset.uri,
            name: asset.name,
            type: asset.name.toLowerCase().endsWith('.pdf')
              ? 'application/pdf'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
          setResumeName(asset.name);
          toast.showToast('Resume uploaded', 'success');
        } catch (error: unknown) {
          toast.showToast(getApiErrorMessage(error, 'Failed to upload resume'), 'error');
        } finally {
          setUploading(false);
        }
      }
    } catch (error: unknown) {
      toast.showToast(getApiErrorMessage(error, 'Failed to pick document'), 'error');
    }
  };

  const handleImpactPress = () => {
    if (!isProfileComplete) {
      Alert.alert('Complete Your Profile', 'Please fill in your current role, company, skills, and mobile number to continue.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go to Profile',
          onPress: () => router.push('/(tabs)/profile'),
        },
      ]);
      return;
    }
    router.push('/(tabs)/impact');
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
    } catch (error: unknown) {
      toast.showToast(getApiErrorMessage(error, 'Failed to save thought'), 'error');
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
    } catch (error: unknown) {
      toast.showToast(getApiErrorMessage(error, 'Could not load comments.'), 'error');
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
    } catch (error: unknown) {
      toast.showToast(getApiErrorMessage(error, 'Failed to update like'), 'error');
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
    } catch (error: unknown) {
      toast.showToast(getApiErrorMessage(error, 'Failed to add comment'), 'error');
    }
  };

  const isLiked = (post: Post) => {
    return post.likes.includes(user?._id || '');
  };

  const isHR = user?.roles?.includes('HR');

  return (
    <GradientScrollView contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>{greeting}, {user?.name?.split(' ')?.[0] || 'User'}</Text>

      <Pressable style={styles.impactButton} onPress={handleImpactPress}>
        <Text style={styles.impactButtonText}>Add Impact</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Your Professional Details</Text>
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Full Name</Text>
          <TextInput style={styles.profileInput} value={profile.name} onChangeText={(text) => setProfile({ ...profile, name: text })} />
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Email</Text>
          <TextInput style={styles.profileInput} value={profile.email} onChangeText={(text) => setProfile({ ...profile, email: text })} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Mobile Number</Text>
          <TextInput style={styles.profileInput} value={profile.mobile} onChangeText={(text) => setProfile({ ...profile, mobile: text })} keyboardType="phone-pad" placeholder="For HR contact" />
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Current Role</Text>
          <TextInput style={styles.profileInput} value={profile.currentRole} onChangeText={(text) => setProfile({ ...profile, currentRole: text })} placeholder="e.g. Software Engineer" />
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Previous Role</Text>
          <TextInput style={styles.profileInput} value={profile.previousRole} onChangeText={(text) => setProfile({ ...profile, previousRole: text })} placeholder="e.g. Junior Developer" />
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Current Company</Text>
          <TextInput style={styles.profileInput} value={profile.company} onChangeText={(text) => setProfile({ ...profile, company: text })} placeholder="e.g. Google, Microsoft" />
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Previous Company</Text>
          <TextInput style={styles.profileInput} value={profile.previousCompany} onChangeText={(text) => setProfile({ ...profile, previousCompany: text })} placeholder="e.g. ABC Corp" />
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Job Description</Text>
          <TextInput
            style={[styles.profileInput, styles.textArea]}
            value={profile.jobDescription}
            onChangeText={(text) => setProfile({ ...profile, jobDescription: text })}
            placeholder="Brief description of your current role"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Skills (comma separated)</Text>
          <TextInput
            style={[styles.profileInput, styles.textArea]}
            value={profile.skills}
            onChangeText={(text) => setProfile({ ...profile, skills: text })}
            placeholder="e.g. React, Node.js, Python"
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>LinkedIn Profile URL</Text>
          <TextInput style={styles.profileInput} value={profile.linkedinUrl} onChangeText={(text) => setProfile({ ...profile, linkedinUrl: text })} placeholder="https://linkedin.com/in/username" autoCapitalize="none" />
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>GitHub Profile URL</Text>
          <TextInput style={styles.profileInput} value={profile.githubUrl} onChangeText={(text) => setProfile({ ...profile, githubUrl: text })} placeholder="https://github.com/username" autoCapitalize="none" />
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Resume</Text>
          <Pressable style={styles.uploadButton} onPress={handleResumePick} disabled={uploading}>
            <Text style={styles.uploadButtonText}>{uploading ? 'Uploading...' : resumeName ? 'Replace Resume' : 'Upload Resume'}</Text>
          </Pressable>
          {resumeName && <Text style={styles.fileName}>{resumeName}</Text>}
        </View>
        <Pressable style={styles.saveButton} onPress={handleSaveProfile} disabled={savingProfile}>
          <Text style={styles.saveButtonText}>{savingProfile ? 'Saving...' : 'Save Details'}</Text>
        </Pressable>
      </View>

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
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
