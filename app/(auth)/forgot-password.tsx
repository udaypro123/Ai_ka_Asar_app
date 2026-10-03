import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import authService from '../../src/services/auth.service';
import { AuthContainer } from '../../src/components/auth/AuthContainer';
import { AuthInput } from '../../src/components/auth/AuthInput';
import { AuthButton } from '../../src/components/auth/AuthButton';
import { AuthLink } from '../../src/components/auth/AuthLink';
import { colors, typography, spacing } from '../../src/theme';
import { useToast } from '../../src/components/common/Toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigation = useNavigation<any>();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
      toast.showToast('Reset link sent to your email', 'success');
    } catch (error: any) {
      toast.showToast(error.message || 'Failed to send reset email', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthContainer title="Check Your Email" subtitle="We've sent a password reset link">
        <View style={styles.card}>
          <Text style={styles.successText}>We've sent a password reset link to your email address.</Text>
          <AuthLink
            text="Remember your password?"
            linkText="Back to Login"
            onPress={() => navigation.navigate('login')}
          />
        </View>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer title="Forgot Password?" subtitle="Enter your email to reset your password">
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthInput
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />

          <AuthButton title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={isLoading} />

          <AuthLink
            text="Remember your password?"
            linkText="Back to Login"
            onPress={() => navigation.navigate('login')}
          />
        </View>
      </KeyboardAvoidingView>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  successText: {
    fontSize: typography.fontSize.base,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
