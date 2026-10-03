import { useState } from 'react';
import { Alert, Image, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { env } from '../../config/env';

export function GoogleAuthButton({
  disabled,
  mode,
  onCredential,
  onError,
}: {
  disabled: boolean;
  mode: 'signin' | 'signup';
  onCredential: (idToken: string) => void;
  onError: (message: string) => void;
}) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const label = mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google';

  const signIn = async () => {
    if (!env.GOOGLE_WEB_CLIENT_ID) {
      const message =
        'Google sign-in is not configured. Set GOOGLE_WEB_CLIENT_ID in AIMarg_mobile/.env and rebuild the app.';
      onError(message);
      Alert.alert('Google sign-in unavailable', message);
      return;
    }

    setIsSigningIn(true);
    try {
      GoogleSignin.configure({
        webClientId: env.GOOGLE_WEB_CLIENT_ID,
        iosClientId: env.GOOGLE_IOS_CLIENT_ID || undefined,
      });
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const result = await GoogleSignin.signIn();
      if (result.type !== 'success') return;

      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) {
        onError('Google did not return an ID token. Check your OAuth client configuration.');
        return;
      }
      onCredential(idToken);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Google sign-in could not be completed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || isSigningIn}
      onPress={signIn}
      style={({ pressed }) => [
        styles.button,
        (disabled || isSigningIn) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Image
        source={require('../../../assets/search.png')}
        style={styles.googleMark}
        resizeMode="contain"
        accessibilityLabel="Google"
      />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderWidth: 1.5,
    borderColor: '#858585',
    borderRadius: 24,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 20,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    backgroundColor: '#f3f4f6',
  },
  googleMark: {
    width: 22,
    height: 22,
  },
  label: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
});
