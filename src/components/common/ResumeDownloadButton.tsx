import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { userService } from '../../services/user.service';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { useToast } from './Toast';
import { getApiErrorMessage } from '../../utils/apiError';

interface ResumeDownloadButtonProps {
  userId: string;
  compact?: boolean;
}

export function ResumeDownloadButton({ userId, compact = false }: ResumeDownloadButtonProps) {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await userService.downloadResume(userId);
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Could not download resume'), 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.button, compact && styles.compactButton, downloading && styles.disabled]}
      onPress={handleDownload}
      disabled={downloading}
    >
      <Text style={[styles.text, compact && styles.compactText]}>
        {downloading ? 'Preparing resume...' : 'Download Resume'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  text: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  compactText: { fontSize: typography.fontSize.xs },
  disabled: { opacity: 0.65 },
});
