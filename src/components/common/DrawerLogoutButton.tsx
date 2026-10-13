import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppRouter as useRouter } from '../../navigation';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { AimargLoader } from './AimargLoader';

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
        <AimargLoader compact message="Logging out" />
      ) : (
        <View style={styles.content}>
          <Ionicons name="log-out-outline" size={20} color="#BE123C" />
          <Text style={styles.label}>Logout</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  buttonPressed: {
    backgroundColor: '#FFE4E6',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#BE123C',
    fontSize: 15,
    fontWeight: '700',
  },
});