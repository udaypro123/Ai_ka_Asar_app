import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useNavigation } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { checkAuth } from '../src/store/slices/authSlice';
import { colors } from '../src/theme';

export default function Index() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

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
    if (!isLoading) {
      if (isAuthenticated && user) {
        if (user.roles && user.roles.length > 0) {
          const role = user.roles[0];
          if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            navigation.replace('(admin)' as any);
          } else if (role === 'HR') {
            navigation.replace('(hr)' as any);
          } else {
            navigation.replace('(user)' as any);
          }
        } else {
          navigation.replace('(onboarding)' as any);
        }
      } else {
        navigation.replace('(auth)' as any);
      }
    }
  }, [isLoading, isAuthenticated, user, navigation]);

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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
