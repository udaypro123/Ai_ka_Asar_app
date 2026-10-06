
import { useState, useEffect, useRef } from 'react';
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
import { getApiErrorMessage } from '../../src/utils/apiError';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<AccountRole>('USER');

  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, isNewUser, user } = useAppSelector(
    (state) => state.auth
  );
  const toast = useToast();

  const navigation = useNavigation<any>();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user && !hasNavigated.current) {
      hasNavigated.current = true;

      if (user.roles?.includes('HR')) {
        router.replace('(hr)' as any);
      } else if (isNewUser) {
        router.replace('(onboarding)' as any);
      } else if (user.roles && user.roles.length > 0) {
        const userRole = user.roles[0];

        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
          router.replace('(admin)' as any);
        } else if (userRole === 'HR') {
          router.replace('(hr)' as any);
        } else {
          router.replace('(tabs)' as any);
        }
      } else {
        router.replace('(onboarding)' as any);
      }
    }
  }, [isAuthenticated, isNewUser, user, router]);

  if (isAuthenticated && user) {
    return null;
  }

  const handleRegister = async () => {
    try {
      await dispatch(register({ name, email, password, role })).unwrap();
      toast.showToast('Account created successfully', 'success');
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

            <AuthInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
            />

            <AuthInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
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

            <AuthDivider />

            <GoogleAuthButton
              disabled={isLoading}
              mode="signup"
              onCredential={async (credential) => {
                await dispatch(googleLogin({ ...credential, role })).unwrap();
                toast.showToast('Google sign up successful', 'success');
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
