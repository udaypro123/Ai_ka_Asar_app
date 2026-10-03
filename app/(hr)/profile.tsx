import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { logout, updateProfile } from '../../src/store/slices/authSlice';
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
  const [company, setCompany] = useState(user?.company || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [saving, setSaving] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

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
          company,
          skills: skillsArray,
        } as any)
      ).unwrap();
      toast.showToast('Profile updated', 'success');
    } catch (error) {
      toast.showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    setShowConfirm(false);
    await dispatch(logout());
    toast.showToast('Logged out successfully', 'success');
    router.replace('/(auth)/login');
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
{/* 
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

          <Text style={styles.label}>Company / Organization</Text>
          <TextInput style={styles.input} value={company} onChangeText={setCompany} placeholder="e.g. Google, Microsoft" />

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

          <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
          </Pressable>
        </View>
      </View> */}

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
          <Text style={[styles.menuItemText, styles.dangerText]}>Delete My Account</Text>
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      {showConfirm && (
        <View style={styles.overlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>Logout</Text>
            <Text style={styles.confirmMessage}>Are you sure you want to logout?</Text>
            <View style={styles.confirmActions}>
              <Pressable style={styles.cancelButton} onPress={() => setShowConfirm(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmButton} onPress={confirmLogout}>
                <Text style={styles.confirmButtonText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
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
  dangerText: {
    color: colors.error,
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(21, 52, 174, 0.61)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  confirmDialog: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    elevation: 8,
    shadowColor: colors.auth.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  confirmTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.auth.text,
    marginBottom: spacing.sm,
  },
  confirmMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    marginBottom: spacing.lg,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  cancelButtonText: {
    color: colors.auth.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  confirmButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
