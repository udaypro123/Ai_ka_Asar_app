import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import authService from '../../src/services/auth.service';
import { useToast } from '../../src/components/common/Toast';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordData) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(data.token, data.password);
      setSuccess(true);
      toast.showToast('Password reset successfully', 'success');
    } catch (error: any) {
      toast.showToast(error.message || 'Failed to reset password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Password Reset</Text>
          <Text style={styles.subtitle}>Your password has been reset successfully.</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your reset token and new password</Text>

        <Controller
          control={control}
          name="token"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Reset Token"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.token && <Text style={styles.error}>{errors.token.message}</Text>}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
            />
          )}
        />
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

        <Pressable style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Resetting...' : 'Reset Password'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  error: {
    color: '#EF4444',
    marginBottom: 16,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
