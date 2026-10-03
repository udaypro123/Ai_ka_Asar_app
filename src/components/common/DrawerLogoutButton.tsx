import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppRouter as useRouter } from '../../navigation';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

export function DrawerLogoutButton() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout());
    } finally {
      router.replace('/(auth)/login');
    }
  };

  const showConfirmation = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => void confirmLogout() },
    ]);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isLoggingOut }}
      disabled={isLoggingOut}
      style={({ pressed }) => [styles.button, pressed && !isLoggingOut && styles.buttonPressed]}
      onPress={showConfirmation}
    >
      {isLoggingOut ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <View style={styles.content}>
          <Ionicons name="log-out-outline" size={20} color="#ffffff" />
          <Text style={styles.label}>Logout</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f80000b0',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  buttonPressed: {
    backgroundColor: '#dc2626',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});