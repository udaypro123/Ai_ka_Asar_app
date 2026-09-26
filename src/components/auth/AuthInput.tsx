import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  error?: string;
  onBlur?: () => void;
  onToggleSecure?: () => void;
}

export function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  onBlur,
  onToggleSecure,
}: AuthInputProps) {
  const showToggle = secureTextEntry !== undefined && onToggleSecure !== undefined;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error && styles.inputError, showToggle && styles.inputWithToggle]}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {showToggle && (
          <TouchableOpacity style={styles.toggleButton} onPress={onToggleSecure}>
            <Ionicons
              name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: "black",
    marginBottom: spacing.xs,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.select({ ios: 12, android: 10 }),
    fontSize: typography.fontSize.base,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  inputWithToggle: {
    paddingRight: spacing.xl + 8,
  },
  toggleButton: {
    position: 'absolute',
    right: spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
});
