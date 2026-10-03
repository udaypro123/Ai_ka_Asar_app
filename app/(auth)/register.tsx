
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppRouter as useRouter } from '@/navigation';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { googleLogin, register, setGoogleError } from '../../src/store/slices/authSlice';
import { AuthContainer } from '../../src/components/auth/AuthContainer';
import { AuthInput } from '../../src/components/auth/AuthInput';
import { AuthButton } from '../../src/components/auth/AuthButton';
import { AuthLink } from '../../src/components/auth/AuthLink';
import { GoogleAuthButton } from '../../src/components/auth/GoogleAuthButton';
import { colors, typography, spacing, borderRadius } from '../../src/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, isNewUser, user } = useAppSelector(
    (state) => state.auth
  );

  const navigation = useNavigation<any>();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user && !hasNavigated.current) {
      hasNavigated.current = true;

      if (isNewUser) {
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

  return (
    <AuthContainer
      title="Create Account"
      subtitle="Start your AI career journey"
    >
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* AIMarg brand mark */}
        <Image
          source={require('../../assets/icon1.png')}
          style={styles.gif}
          resizeMode="contain"
        />

        {/* Login/Register Card */}
        <View style={styles.card}>
          <View style={styles.header}>
             <Text style={styles.title}>Welcome Back</Text>
            
            <Text style={styles.subtitle}>
              Create your account to get started
            </Text>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

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
            onPress={() =>
              dispatch(register({ name, email, password }))
            }
            loading={isLoading}
          />

          <GoogleAuthButton
            disabled={isLoading}
            mode="signup"
            onCredential={(idToken) => {
              dispatch(googleLogin(idToken));
            }}
            onError={(message) => dispatch(setGoogleError(message))}
          />

          <AuthLink
            text="Already have an Account?"
            linkText="Log in"
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

  /*
   * GIF is above the card.
   * Negative margin makes the card overlap
   * the bottom portion of the GIF.
   */
  gif: {
    width: 250,
    height: 250,
    margin:"auto",
    marginBottom: -70,
    marginTop: -80,
    zIndex: 1,
  },

  /*
   * Card comes over the GIF.
   */
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
    zIndex: 2,
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

  error: {
    color: '#ef4444',
    marginBottom: spacing.md,
    fontSize: typography.fontSize.sm,
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
