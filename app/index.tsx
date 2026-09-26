import { View, ActivityIndicator, StyleSheet, Image, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { checkAuth } from '../src/store/slices/authSlice';
import { colors } from '../src/theme';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const initialize = async () => {
      try {
        await dispatch(checkAuth()).unwrap();
      } catch {
        // ignore auth check failure
      }
    };
    initialize();
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading && !showSplash) {
      if (isAuthenticated && user) {
        if (user.roles && user.roles.length > 0) {
          const role = user.roles[0];
          if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            router.replace('/(admin)');
          } else if (role === 'HR') {
            router.replace('/(hr)');
          } else {
            router.replace('/(tabs)');
          }
        } else {
          router.replace('/(onboarding)/welcome');
        }
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, isAuthenticated, user, showSplash, router]);

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowSplash(false);
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSplash, fadeAnim]);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('../assets/aimarg.gif')}
          style={styles.gif}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <LinearGradient
        colors={[colors.auth.bgStart, colors.auth.bgEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <ActivityIndicator size="large" color={colors.primaryLight} />
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gif: {
    width: width * 0.7,
    height: height * 0.4,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
