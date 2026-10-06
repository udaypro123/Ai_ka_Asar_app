import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams } from '@/navigation';
import { AimargLoader } from '../../src/components/common/AimargLoader';
import { useAppSelector } from '../../src/store/hooks';
import { adminService } from '../../src/services/admin.service';
import { User } from '../../src/types';
import { borderRadius, colors, spacing, typography } from '../../src/theme';
import { GradientScrollView } from '../../src/components/common/BackgroundGradient';
import { openExternalUrl } from '../../src/utils/externalLinks';
import { ResumeDownloadButton } from '../../src/components/common/ResumeDownloadButton';
import { usePageRefresh } from '../../src/components/common/PageRefresh';
import { ToastOnlyNotice } from '../../src/components/common/ToastOnlyNotice';
import { useToast } from '../../src/components/common/Toast';
import { getApiErrorMessage } from '../../src/utils/apiError';

export default function UserDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { showToast } = useToast();

  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('HR');

  const loadUser = useCallback(async () => {
    try {
      const data = await adminService.getUserById(userId as string);
      setProfile(data as User);
    } catch (error: unknown) {
      setLoadError(true);
      showToast(getApiErrorMessage(error, 'Could not load this user.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, userId]);

  useEffect(() => {
    if (isAdmin && userId) void loadUser().catch(() => undefined);
  }, [isAdmin, loadUser, userId]);

  usePageRefresh(loadUser);

  const openLink = (url?: string) => {
    void openExternalUrl(url);
  };

  if (!isAdmin) {
    return <ToastOnlyNotice message="You do not have permission to view this page." />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <AimargLoader />
      </View>
    );
  }

  if (!profile && loadError) {
    return <View style={styles.loadingContainer} />;
  }

  if (!profile) {
    return <ToastOnlyNotice message="User not found" />;
  }

  const InfoRow = ({ label, value, link }: { label: string; value?: string; link?: boolean }) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, link && styles.linkText]}>{value}</Text>
      </View>
    );
  };

  return (
    <GradientScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.headerSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{profile.roles[0]}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Contact Information</Text>
        <InfoRow label="Email" value={profile.email} />
        <InfoRow label="Mobile" value={profile.mobile} />

        <Text style={styles.sectionTitle}>Professional Details</Text>
        <InfoRow label="Current Role" value={profile.currentRole} />
        <InfoRow label="Previous Role" value={profile.previousRole} />
        <InfoRow label="Current Company" value={profile.company} />
        <InfoRow label="Previous Company" value={profile.previousCompany} />
        <InfoRow label="Employment Status" value={profile.employmentStatus} />
        <InfoRow label="Experience" value={profile.experience} />
        <InfoRow label="Profession" value={profile.profession} />
        <InfoRow label="Industry" value={profile.industry} />

        <Text style={styles.sectionTitle}>Job Description</Text>
        {profile.jobDescription ? (
          <Text style={styles.descriptionText}>{profile.jobDescription}</Text>
        ) : (
          <Text style={styles.noDataText}>No job description provided</Text>
        )}

        <Text style={styles.sectionTitle}>Skills</Text>
        {profile.skills && profile.skills.length > 0 ? (
          <View style={styles.skillsContainer}>
            {profile.skills.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noDataText}>No skills listed</Text>
        )}

        <Text style={styles.sectionTitle}>Profiles</Text>
        {profile.linkedinUrl && (
          <Pressable style={styles.linkButton} onPress={() => openLink(profile.linkedinUrl)}>
            <Text style={styles.linkButtonText}>LinkedIn Profile</Text>
          </Pressable>
        )}
        {profile.githubUrl && (
          <Pressable style={styles.linkButton} onPress={() => openLink(profile.githubUrl)}>
            <Text style={styles.linkButtonText}>GitHub Profile</Text>
          </Pressable>
        )}

        {profile.resume && (
          <>
            <Text style={styles.sectionTitle}>Resume</Text>
            <ResumeDownloadButton userId={profile._id} />
          </>
        )}
      </View>
    </GradientScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.auth.text,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  roleBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.auth.cardBorder,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoRow: {
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.auth.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.auth.text,
    lineHeight: 22,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  descriptionText: {
    fontSize: typography.fontSize.base,
    color: colors.auth.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  noDataText: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
    fontStyle: 'italic',
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
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  linkButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  resumeButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resumeButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
