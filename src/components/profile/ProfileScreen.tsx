import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as DocumentPicker from '../../utils/documentPicker';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteAccount, logout, setUserProfile, updateProfile } from '../../store/slices/authSlice';
import { userService } from '../../services/user.service';
import { useToast } from '../common/Toast';
import { GradientScrollView } from '../common/BackgroundGradient';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { useAppRouter as useRouter } from '../../navigation';
import { usePageRefresh } from '../common/PageRefresh';
import { getApiErrorMessage } from '../../utils/apiError';

const defaultNotifications = { email: true, sms: false, whatsapp: false };
const defaultPrivacy = { profileDiscoverable: true };

interface ProfileScreenProps {
  showResume?: boolean;
}

export default function ProfileScreen({ showResume = false }: ProfileScreenProps) {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? '');
  const [mobile, setMobile] = useState(user?.mobile ?? '');
  const [country, setCountry] = useState(user?.country ?? '');
  const [profession, setProfession] = useState(user?.profession ?? '');
  const [industry, setIndustry] = useState(user?.industry ?? '');
  const [experience, setExperience] = useState(user?.experience ?? '');
  const [employmentStatus, setEmploymentStatus] = useState(user?.employmentStatus ?? '');
  const [currentRole, setCurrentRole] = useState(user?.currentRole ?? '');
  const [previousRole, setPreviousRole] = useState(user?.previousRole ?? '');
  const [previousCompany, setPreviousCompany] = useState(user?.previousCompany ?? '');
  const [company, setCompany] = useState(user?.company ?? '');
  const [jobDescription, setJobDescription] = useState(user?.jobDescription ?? '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') ?? '');
  const [careerGoal, setCareerGoal] = useState(user?.careerGoal ?? '');
  const [aiUsage, setAiUsage] = useState(user?.aiUsage ?? '');
  const [aiImpactStatus, setAiImpactStatus] = useState(user?.aiImpactStatus ?? '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl ?? '');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl ?? '');
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [privacySettings, setPrivacySettings] = useState(user?.privacySettings ?? defaultPrivacy);
  const [notificationPreferences, setNotificationPreferences] = useState(
    user?.notificationPreferences ?? defaultNotifications
  );
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [privacyExpanded, setPrivacyExpanded] = useState(false);
  const [notificationsExpanded, setNotificationsExpanded] = useState(false);

  const refreshProfile = useCallback(async () => {
    const latestProfile = await userService.getProfile();
    dispatch(setUserProfile(latestProfile));
  }, [dispatch]);

  usePageRefresh(refreshProfile);

  useEffect(() => {
    setName(user?.name ?? '');
    setMobile(user?.mobile ?? '');
    setCountry(user?.country ?? '');
    setProfession(user?.profession ?? '');
    setIndustry(user?.industry ?? '');
    setExperience(user?.experience ?? '');
    setEmploymentStatus(user?.employmentStatus ?? '');
    setCurrentRole(user?.currentRole ?? '');
    setPreviousRole(user?.previousRole ?? '');
    setPreviousCompany(user?.previousCompany ?? '');
    setCompany(user?.company ?? '');
    setJobDescription(user?.jobDescription ?? '');
    setSkills(user?.skills?.join(', ') ?? '');
    setCareerGoal(user?.careerGoal ?? '');
    setAiUsage(user?.aiUsage ?? '');
    setAiImpactStatus(user?.aiImpactStatus ?? '');
    setLinkedinUrl(user?.linkedinUrl ?? '');
    setGithubUrl(user?.githubUrl ?? '');
    setPrivacySettings(user?.privacySettings ?? defaultPrivacy);
    setNotificationPreferences(user?.notificationPreferences ?? defaultNotifications);
    setResumeName(user?.resume?.split('/').pop() ?? null);
  }, [user]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.showToast('Name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        updateProfile({
          name: name.trim(),
          mobile: mobile.trim(),
          country: country.trim(),
          profession: profession.trim(),
          industry: industry.trim(),
          experience: experience.trim(),
          employmentStatus: employmentStatus.trim(),
          currentRole: currentRole.trim(),
          previousRole: previousRole.trim(),
          previousCompany: previousCompany.trim(),
          company: company.trim(),
          jobDescription: jobDescription.trim(),
          skills: skills.split(',').map((skill) => skill.trim()).filter(Boolean),
          careerGoal: careerGoal.trim(),
          aiUsage: aiUsage.trim(),
          aiImpactStatus: aiImpactStatus.trim(),
          linkedinUrl: linkedinUrl.trim(),
          githubUrl: githubUrl.trim(),
        })
      ).unwrap();
      toast.showToast('Profile updated', 'success');
    } catch (error: unknown) {
      toast.showToast(getApiErrorMessage(error, 'Failed to update profile'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const savePrivacySettings = async (profileDiscoverable: boolean) => {
    const previousSettings = privacySettings;
    const updatedSettings = { ...privacySettings, profileDiscoverable };
    setPrivacySettings(updatedSettings);
    setSavingSettings(true);
    try {
      await dispatch(updateProfile({ privacySettings: updatedSettings })).unwrap();
      toast.showToast('Privacy settings updated', 'success');
    } catch (error: unknown) {
      setPrivacySettings(previousSettings);
      toast.showToast(getApiErrorMessage(error, 'Failed to update privacy settings'), 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const saveNotificationPreferences = async (
    key: keyof typeof defaultNotifications,
    value: boolean
  ) => {
    const previousPreferences = notificationPreferences;
    const updatedPreferences = { ...notificationPreferences, [key]: value };
    setNotificationPreferences(updatedPreferences);
    setSavingSettings(true);
    try {
      await dispatch(updateProfile({ notificationPreferences: updatedPreferences })).unwrap();
      toast.showToast('Notification preferences updated', 'success');
    } catch (error: unknown) {
      setNotificationPreferences(previousPreferences);
      toast.showToast(getApiErrorMessage(error, 'Failed to update preferences'), 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResumePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) {
        toast.showToast('No file selected', 'error');
        return;
      }
      if (!/\.(pdf|docx)$/i.test(asset.name)) {
        toast.showToast('Choose a PDF or DOCX file', 'error');
        return;
      }
      setUploadingResume(true);
      const uploaded = await userService.uploadResume({
        uri: asset.uri,
        name: asset.name,
        type: asset.name.toLowerCase().endsWith('.pdf')
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      dispatch(setUserProfile({ resume: uploaded.user.resume }));
      setResumeName(uploaded.user.resume || asset.name);
      toast.showToast('Resume uploaded', 'success');
    } catch (error: unknown) {
      toast.showToast(getApiErrorMessage(error, 'Failed to upload resume'), 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account and its associated profile data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteAccount()).unwrap();
              toast.showToast('Account deleted', 'success');
              router.replace('/(auth)/login');
            } catch (error: unknown) {
              toast.showToast(getApiErrorMessage(error, 'Failed to delete account'), 'error');
            }
          },
        },
      ]
    );
  };

  const confirmLogout = () => {
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
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile details</Text>
        <View style={styles.card}>
          <ProfileField label="Full name" value={name} onChangeText={setName} />
          <ProfileField label="Mobile number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
          <ProfileField label="Country" value={country} onChangeText={setCountry} />
          <ProfileField label="Profession" value={profession} onChangeText={setProfession} />
          <ProfileField label="Industry" value={industry} onChangeText={setIndustry} />
          <ProfileField label="Experience" value={experience} onChangeText={setExperience} />
          <ProfileField label="Employment status" value={employmentStatus} onChangeText={setEmploymentStatus} />
          <ProfileField label="Current role" value={currentRole} onChangeText={setCurrentRole} />
          <ProfileField label="Previous role" value={previousRole} onChangeText={setPreviousRole} />
          <ProfileField label="Current company" value={company} onChangeText={setCompany} />
          <ProfileField label="Previous company" value={previousCompany} onChangeText={setPreviousCompany} />
          <ProfileField label="Job description" value={jobDescription} onChangeText={setJobDescription} multiline />
          <ProfileField label="Skills (comma separated)" value={skills} onChangeText={setSkills} multiline />
          <ProfileField label="Career goal" value={careerGoal} onChangeText={setCareerGoal} multiline />
          <ProfileField label="AI usage" value={aiUsage} onChangeText={setAiUsage} multiline />
          <ProfileField label="AI impact status" value={aiImpactStatus} onChangeText={setAiImpactStatus} />
          <ProfileField label="LinkedIn URL" value={linkedinUrl} onChangeText={setLinkedinUrl} autoCapitalize="none" />
          <ProfileField label="GitHub URL" value={githubUrl} onChangeText={setGithubUrl} autoCapitalize="none" />
          {showResume && (
            <>
              <Text style={styles.fieldLabel}>Resume (PDF or DOCX only)</Text>
              <Pressable style={styles.secondaryButton} onPress={handleResumePick} disabled={uploadingResume}>
                <Text style={styles.secondaryButtonText}>
                  {uploadingResume ? 'Uploading...' : resumeName ? 'Replace resume' : 'Upload resume'}
                </Text>
              </Pressable>
              {resumeName && <Text style={styles.fileName}>{resumeName}</Text>}
            </>
          )}
          <Pressable style={styles.saveButton} onPress={handleSaveProfile} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save profile'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Pressable style={styles.menuItem} onPress={() => setPrivacyExpanded(!privacyExpanded)}>
          <Text style={styles.menuItemText}>Privacy Settings</Text>
          <Text style={styles.disclosure}>{privacyExpanded ? '−' : '+'}</Text>
        </Pressable>
        {privacyExpanded && (
          <View style={[styles.card, styles.settingsCard]}>
            <PreferenceRow
              title="Profile discoverability"
              description="Allow your profile to appear in community member lists."
              value={privacySettings.profileDiscoverable}
              disabled={savingSettings}
              onValueChange={(value) => savePrivacySettings(value)}
            />
          </View>
        )}
        <Pressable style={styles.menuItem} onPress={() => setNotificationsExpanded(!notificationsExpanded)}>
          <Text style={styles.menuItemText}>Notifications</Text>
          <Text style={styles.disclosure}>{notificationsExpanded ? '−' : '+'}</Text>
        </Pressable>
        {notificationsExpanded && (
          <View style={[styles.card, styles.settingsCard]}>
            <PreferenceRow
              title="Email"
              description="Receive account notifications by email."
              value={notificationPreferences.email}
              disabled={savingSettings}
              onValueChange={(value) => saveNotificationPreferences('email', value)}
            />
            <PreferenceRow
              title="SMS"
              description="Receive notifications by text message."
              value={notificationPreferences.sms}
              disabled={savingSettings}
              onValueChange={(value) => saveNotificationPreferences('sms', value)}
            />
            <PreferenceRow
              title="WhatsApp"
              description="Receive notifications through WhatsApp."
              value={notificationPreferences.whatsapp}
              disabled={savingSettings}
              onValueChange={(value) => saveNotificationPreferences('whatsapp', value)}
            />
          </View>
        )}
        <Pressable style={styles.menuItem} onPress={confirmDeleteAccount}>
          <Text style={[styles.menuItemText, styles.dangerText]}>Delete My Account</Text>
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={confirmLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </GradientScrollView>
  );
}

interface ProfileFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
  multiline?: boolean;
}

function ProfileField({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
}: ProfileFieldProps) {
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholderTextColor={colors.gray500}
      />
    </>
  );
}

interface PreferenceRowProps {
  title: string;
  description: string;
  value: boolean;
  disabled: boolean;
  onValueChange: (value: boolean) => void;
}

function PreferenceRow({ title, description, value, disabled, onValueChange }: PreferenceRowProps) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceText}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.auth.inputBorder, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingVertical: 32 },
  header: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 6,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: colors.white },
  name: { fontSize: 24, fontWeight: '700', color: colors.auth.text, marginBottom: spacing.xs },
  email: { fontSize: 16, color: colors.auth.textSecondary },
  section: { marginBottom: spacing.lg },
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
    // elevation: 3,
  },
  settingsCard: { marginTop: -spacing.xs, marginBottom: spacing.sm },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.auth.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.black,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
    borderColor: colors.auth.inputBorder,
  },
  textArea: { minHeight: 72, textAlignVertical: 'top', backgroundColor: colors.white },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  fileName: { color: colors.primary, fontSize: typography.fontSize.sm, marginTop: spacing.sm },
  menuItem: {
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: typography.fontSize.base,
    color: colors.auth.text,
    fontWeight: typography.fontWeight.medium,
  },
  disclosure: { color: colors.auth.textSecondary, fontSize: 20 },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  preferenceText: { flex: 1, paddingRight: spacing.sm },
  preferenceTitle: {
    fontSize: typography.fontSize.base,
    color: colors.auth.text,
    fontWeight: typography.fontWeight.medium,
  },
  preferenceDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    marginTop: spacing.xs,
  },
  dangerText: { color: colors.error },
  logoutButton: {
    backgroundColor: colors.auth.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
    marginBottom: 15,
  },
  logoutText: {
    color: colors.error,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
