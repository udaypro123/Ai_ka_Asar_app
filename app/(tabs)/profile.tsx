import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import * as DocumentPicker from '../../src/utils/documentPicker';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { logout, updateProfile } from '../../src/store/slices/authSlice';
import { userService } from '../../src/services/user.service';
import { useToast } from '../../src/components/common/Toast';
import { GradientScrollView } from '@/components/common/BackgroundGradient';
import { borderRadius, colors, spacing, typography } from '@/theme';
import { useAppRouter as useRouter } from '@/navigation';

export default function ProfileScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const toast = useToast();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [currentRole, setCurrentRole] = useState(user?.currentRole || '');
  const [previousRole, setPreviousRole] = useState(user?.previousRole || '');
  const [previousCompany, setPreviousCompany] = useState(user?.previousCompany || '');
  const [company, setCompany] = useState(user?.company || '');
  const [jobDescription, setJobDescription] = useState(user?.jobDescription || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '');
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.resume) {
      setResumeName(user.resume.split('/').pop() || 'Resume uploaded');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      await dispatch(
        updateProfile({
          name,
          email,
          mobile,
          currentRole,
          previousRole,
          previousCompany,
          company,
          jobDescription,
          skills: skillsArray,
          linkedinUrl: linkedinUrl.trim() ? linkedinUrl.trim() : undefined,
          githubUrl: githubUrl.trim() ? githubUrl.trim() : undefined,
        } as any)
      ).unwrap();
      toast.showToast('Profile updated', 'success');
    } catch (error) {
      toast.showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResumePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });
      if (result.canceled) {
        return;
      }
      const asset = result.assets?.[0];
      if (!asset) {
        toast.showToast('No file selected', 'error');
        return;
      }
      setUploading(true);
      try {
        await userService.uploadResume({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/pdf',
        } as any);
        setResumeName(asset.name);
        toast.showToast('Resume uploaded', 'success');
      } catch (error) {
        toast.showToast('Failed to upload resume', 'error');
      } finally {
        setUploading(false);
      }
    } catch (error) {
      toast.showToast('Failed to pick document', 'error');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logout());
          toast.showToast('Logged out successfully', 'success');
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <GradientScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Details</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput style={styles.input} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" placeholder="For HR contact" />

          <Text style={styles.label}>Current Role</Text>
          <TextInput style={styles.input} value={currentRole} onChangeText={setCurrentRole} placeholder="e.g. Software Engineer" />

          <Text style={styles.label}>Previous Role</Text>
          <TextInput style={styles.input} value={previousRole} onChangeText={setPreviousRole} placeholder="e.g. Junior Developer" />

          <Text style={styles.label}>Current Company</Text>
          <TextInput style={styles.input} value={company} onChangeText={setCompany} placeholder="e.g. Google, Microsoft" />

          <Text style={styles.label}>Previous Company</Text>
          <TextInput style={styles.input} value={previousCompany} onChangeText={setPreviousCompany} placeholder="e.g. ABC Corp" />

          <Text style={styles.label}>Job Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={jobDescription}
            onChangeText={setJobDescription}
            placeholder="Brief description of your current role"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Skills (comma separated)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={skills}
            onChangeText={setSkills}
            placeholder="e.g. React, Node.js, Python"
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />

          <Text style={styles.label}>LinkedIn Profile URL</Text>
          <TextInput style={styles.input} value={linkedinUrl} onChangeText={setLinkedinUrl} placeholder="https://linkedin.com/in/username" autoCapitalize="none" />

          <Text style={styles.label}>GitHub Profile URL</Text>
          <TextInput style={styles.input} value={githubUrl} onChangeText={setGithubUrl} placeholder="https://github.com/username" autoCapitalize="none" />

          <Text style={styles.label}>Resume</Text>
          <Pressable style={styles.uploadButton} onPress={handleResumePick} disabled={uploading}>
            <Text style={styles.uploadButtonText}>{uploading ? 'Uploading...' : resumeName ? 'Replace Resume' : 'Upload Resume'}</Text>
          </Pressable>
          {resumeName && <Text style={styles.fileName}>{resumeName}</Text>}

          <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuItemText}>Privacy Settings</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuItemText}>Notifications</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuItemText}>Download My Data</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuItemText}>Delete My Account</Text>
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </GradientScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.auth.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: 16,
    color: colors.auth.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    elevation: 4,
    shadowColor: colors.auth.glow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.auth.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.auth.inputBg1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.auth.text,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
    borderColor: colors.auth.inputBorder1,
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
    marginTop: spacing.lg,
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
  menuItem: {
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    elevation: 4,
    shadowColor: colors.auth.glow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  menuItemText: {
    fontSize: typography.fontSize.base,
    color: colors.auth.text,
    fontWeight: typography.fontWeight.medium,
  },
  logoutButton: {
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    marginBottom: 15,
  },
  logoutText: {
    color: colors.error,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
