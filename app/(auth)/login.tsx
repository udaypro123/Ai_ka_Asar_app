
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppRouter as useRouter } from '@/navigation';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { googleLogin, login } from '../../src/store/slices/authSlice';
import { AuthContainer } from '../../src/components/auth/AuthContainer';
import { AuthInput } from '../../src/components/auth/AuthInput';
import { AuthButton } from '../../src/components/auth/AuthButton';
import { AuthLink } from '../../src/components/auth/AuthLink';
import { GoogleAuthButton } from '../../src/components/auth/GoogleAuthButton';
import { AuthDivider } from '../../src/components/auth/AuthDivider';
import { typography, spacing } from '../../src/theme';
import { storage } from '../../src/utils/storage';
import { useToast } from '../../src/components/common/Toast';
import { getApiErrorMessage } from '../../src/utils/apiError';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const dispatch = useAppDispatch();

  const { isLoading, isAuthenticated, isNewUser, user } = useAppSelector(
    (state) => state.auth
  );
  const toast = useToast();

  const navigation = useNavigation<any>();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await storage.getItem('rememberedEmail');

        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch {
        // ignore
      }
    };

    loadSavedEmail();
  }, []);

  useEffect(() => {
    if (rememberMe) {
      storage.setItem('rememberedEmail', email);
    }
  }, [email, rememberMe]);

  const toggleRememberMe = async () => {
    const newValue = !rememberMe;

    setRememberMe(newValue);

    if (newValue) {
      await storage.setItem('rememberedEmail', email);
    } else {
      await storage.removeItem('rememberedEmail');
    }
  };

  const handleLogin = async () => {
    try {
      await dispatch(login({ email, password })).unwrap();
    } catch (error: unknown) {
      toast.showToast(getApiErrorMessage(error, 'Login failed. Please try again.'), 'error');
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && !hasNavigated.current) {
      hasNavigated.current = true;

      if (isNewUser) {
        router.replace('(onboarding)' as any);
      } else if (user.roles && user.roles.length > 0) {
        const role = user.roles[0];

        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
          router.replace('(admin)' as any);
        } else if (role === 'HR') {
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

  return (
    <AuthContainer
      title="Welcome Back"
      subtitle="Sign in to continue"
    >
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.loginWrapper}>

          <Image
            source={require('../../assets/icon3.png')}
            style={styles.brandMark}
            resizeMode="contain"
          />

          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>

              <Text style={styles.subtitle}>
                Sign in to continue
              </Text>
            </View>

            <AuthInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="demo@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AuthInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              onToggleSecure={() =>
                setShowPassword((prev) => !prev)
              }
            />

            <View style={styles.actionsRow}>
              <Pressable
                style={styles.rememberMe}
                onPress={toggleRememberMe}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
                >
                  {rememberMe && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>

                <Text style={styles.rememberMeText}>
                  Remember Me
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  navigation.navigate('forgot-password')
                }
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot Password?
                </Text>
              </Pressable>
            </View>

            <AuthButton
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
            />

            <AuthDivider />

            <GoogleAuthButton
              disabled={isLoading}
              mode="signin"
              onCredential={async (credential) => {
                await dispatch(googleLogin(credential)).unwrap();
              }}
              onError={(message) => toast.showToast(message, 'error')}
            />

            <AuthLink
              text="Don't have an Account ?"
              linkText="Sign up"
              onPress={() => navigation.navigate('register')}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginWrapper: {
    width: '100%',
    alignItems: 'center',
  },

  brandMark: {
    width: 160,
    height: 160,
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

    shadowOpacity: 0.2,
    shadowRadius: 24,

    // elevation: 8,
  },

  header: {
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000000',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: typography.fontSize.base,
    color: '#000103',
    textAlign: 'center',
  },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxChecked: {
    backgroundColor: '#3131ec',
  },

  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 18,
    textAlign: 'center',
  },

  rememberMeText: {
    color: '#0060e7',
    fontSize: typography.fontSize.sm,
  },

  forgotPasswordText: {
    color: '#2563eb',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
});
