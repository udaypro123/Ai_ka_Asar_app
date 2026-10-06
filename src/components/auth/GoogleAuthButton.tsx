import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { env } from '../../config/env';
import type { GoogleCredential } from '../../services/auth.service';
import { getApiErrorMessage } from '../../utils/apiError';

export function GoogleAuthButton({
  disabled,
  mode,
  onCredential,
  onError,
}: {
  disabled: boolean;
  mode: 'signin' | 'signup';
  onCredential: (credential: GoogleCredential) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const label = mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google';

  const signIn = async () => {
    if (Platform.OS === 'android' && !env.GOOGLE_ANDROID_CLIENT_ID) {
      const message =
        'Android Google sign-in is missing EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID. Also register package com.AIMarg.app and this build’s signing SHA-1 in Google Cloud Console.';
      onError(message);
      return;
    }

    if (Platform.OS !== 'android' && !env.GOOGLE_WEB_CLIENT_ID) {
      const message =
        'Google sign-in is missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Set it in AIMarg_mobile/.env and add the client ID to the backend GOOGLE_CLIENT_IDS.';
      onError(message);
      return;
    }

    setIsSigningIn(true);
    try {
      if (Platform.OS === 'android') {
        GoogleSignin.configure({});
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      } else {
        GoogleSignin.configure({
          webClientId: env.GOOGLE_WEB_CLIENT_ID,
          iosClientId: env.GOOGLE_IOS_CLIENT_ID || undefined,
        });
      }

      const result = await GoogleSignin.signIn();
      if (result.type !== 'success') return;

      const tokens = await GoogleSignin.getTokens();
      let credential: GoogleCredential;
      if (Platform.OS === 'android') {
        if (!tokens.accessToken) {
          onError('Google did not return an access token. Check the Android package and signing SHA-1 in Google Cloud Console.');
          return;
        }
        credential = { accessToken: tokens.accessToken };
      } else {
        if (!tokens.idToken) {
          onError('Google did not return an ID token. Check your OAuth client configuration.');
          return;
        }
        credential = { idToken: tokens.idToken };
      }

      try {
        await onCredential(credential);
      } catch (error: unknown) {
        const message = getApiErrorMessage(error, 'Google authentication failed. Please try again.');
        try {
          await GoogleSignin.signOut();
        } catch (signOutError: unknown) {
          onError(
            `${message} Could not reset Google account selection: ${getApiErrorMessage(signOutError, 'Please restart the app and try again.')}`
          );
          return;
        }
        onError(message);
      }
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
      if (
        Platform.OS === 'android' &&
        (code === '10' || (error instanceof Error && error.message.includes('DEVELOPER_ERROR')))
      ) {
        onError(
          'Google sign-in setup is incomplete. In Google Cloud Console, add Android package com.AIMarg.app with SHA-1 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25, then rebuild and reinstall the app.'
        );
      } else {
        onError(error instanceof Error ? error.message : 'Google sign-in could not be completed.');
      }
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
