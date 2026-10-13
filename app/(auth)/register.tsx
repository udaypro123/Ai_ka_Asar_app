
import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppRouter as useRouter } from '@/navigation';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { googleLogin, register } from '../../src/store/slices/authSlice';
import { AuthContainer } from '../../src/components/auth/AuthContainer';
import { AuthInput } from '../../src/components/auth/AuthInput';
import { AuthButton } from '../../src/components/auth/AuthButton';
import { AuthLink } from '../../src/components/auth/AuthLink';
import { GoogleAuthButton } from '../../src/components/auth/GoogleAuthButton';
import { AuthDivider } from '../../src/components/auth/AuthDivider';
import { useToast } from '../../src/components/common/Toast';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import type { AccountRole } from '../../src/services/auth.service';
import authService from '../../src/services/auth.service';
import { getApiErrorMessage } from '../../src/utils/apiError';
import { getPostAuthRoute } from '../../src/navigation/postAuthRoute';
import { registerSchema } from '../../src/schemas/auth.schema';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [signupToken, setSignupToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<AccountRole>('USER');

  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const toast = useToast();

  const navigation = useNavigation<any>();
  const router = useRouter();

  if (isAuthenticated && user) {
    return null;
  }

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setOtp('');
    setOtpSent(false);
    setSignupToken('');
  };

  const handleSendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.showToast('Enter a valid email address first.', 'error');
      return;
    }
    setSendingOtp(true);
    try {
      await authService.sendSignupOtp(normalizedEmail);
      setEmail(normalizedEmail);
      setOtpSent(true);
      toast.showToast('Verification code sent to your email.', 'success');
    } catch (error) {
      toast.showToast(getApiErrorMessage(error, 'Could not send verification code.'), 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedOtp = otp.trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      toast.showToast('Enter the 6-digit code sent to your email.', 'error');
      return;
    }
    setVerifyingOtp(true);
    try {
      const result = await authService.verifySignupOtp(email.trim().toLowerCase(), normalizedOtp);
      setSignupToken(result.signupToken);
      toast.showToast('Email verified. Complete your account details.', 'success');
    } catch (error) {
      toast.showToast(getApiErrorMessage(error, 'Could not verify the code.'), 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRegister = async () => {
    const validation = registerSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      password,
      signupToken,
      role,
    });
    if (!validation.success) {
      toast.showToast(validation.error.issues[0]?.message ?? 'Please check your sign-up details.', 'error');
      return;
    }

    try {
      const response = await dispatch(register(validation.data)).unwrap();
      toast.showToast('Account created successfully', 'success');
      router.replace(getPostAuthRoute(response.user));
    } catch (error) {
      const message = getApiErrorMessage(error, 'Sign up failed. Please try again.');
      if (/already\s+(registered|exists)|email.*in use/i.test(message)) {
        toast.showToast('User already exists. Please log in.', 'error');
        return;
      }
      toast.showToast(message, 'error');
    }
  };

  return (
    <AuthContainer
      title="Create Account"
      subtitle="Start your AI career journey"
    >
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require('../../assets/icon3.png')}
            style={styles.brandMark}
            resizeMode="contain"
          />

          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Create your account to get started
              </Text>
            </View>

            <Text style={styles.roleLabel}>Select Role</Text>
            <View style={styles.roleContainer}>
              {(['USER', 'HR'] as const).map((option) => {
                const selected = role === option;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    onPress={() => setRole(option)}
                    style={[styles.roleButton, selected && styles.roleButtonActive]}
                  >
                    <Text style={[styles.roleButtonText, selected && styles.roleButtonTextActive]}>
                      {option === 'USER' ? 'User' : 'HR'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {!signupToken ? (
              <>
                <AuthInput
                  label="Email"
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <AuthButton
                  title={otpSent ? 'Resend verification code' : 'Send verification code'}
                  onPress={handleSendOtp}
                  loading={sendingOtp}
                  disabled={isLoading || verifyingOtp}
                />
                {otpSent && (
                  <>
                    <AuthInput
                      label="Email verification code"
                      value={otp}
                      onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      keyboardType="numeric"
                      autoCapitalize="none"
                    />
                    <AuthButton
                      title="Verify email"
                      onPress={handleVerifyOtp}
                      loading={verifyingOtp}
                      disabled={isLoading || otp.length !== 6}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <View style={styles.verifiedEmail}>
                  <Text style={styles.verifiedEmailText}>Email verified: {email}</Text>
                  <Pressable onPress={() => handleEmailChange('')}>
                    <Text style={styles.changeEmailText}>Change</Text>
                  </Pressable>
                </View>
                <AuthInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                />
                <AuthInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  secureTextEntry={!showPassword}
                  onToggleSecure={() => setShowPassword((prev) => !prev)}
                />
                <AuthButton
                  title="Sign Up"
                  onPress={handleRegister}
                  loading={isLoading}
                />
              </>
            )}

            <AuthDivider />

            <GoogleAuthButton
              disabled={isLoading}
              mode="signup"
              onCredential={async (credential) => {
                const response = await dispatch(googleLogin({ ...credential, role })).unwrap();
                toast.showToast('Google sign up successful', 'success');
                router.replace(getPostAuthRoute(response.user, response.isNewUser));
              }}
              onError={(message) => toast.showToast(message, 'error')}
            />

            <AuthLink
              text="Already have an Account?"
              linkText="Log in"
              onPress={() => navigation.navigate('login')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },

  brandMark: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },

  card: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: 'white',
    padding: spacing.md,

    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 1,
    shadowRadius: 24,

    // elevation: 12,
  },

  header: {
    marginBottom: spacing.lg,
  },

  verifiedEmail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#f1f1ff',
  },

  verifiedEmailText: {
    flex: 1,
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  changeEmailText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000409',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: typography.fontSize.base,
    color: '#000101',
    textAlign: 'center',
  },

  roleLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.black,
    marginBottom: spacing.sm,
  },

  roleContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  roleButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    backgroundColor: colors.auth.cardBg,
    alignItems: 'center',
  },

  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  roleButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.auth.textSecondary,
  },

  roleButtonTextActive: {
    color: colors.white,
  },
});
