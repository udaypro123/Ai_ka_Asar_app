import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import authService from '../../src/services/auth.service';
import { useToast } from '../../src/components/common/Toast';

export default function VerifyEmailScreen() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const handleVerify = async () => {
    if (!token) {
      toast.showToast('Please enter verification token', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await authService.verifyEmail(token);
      setSuccess(true);
      toast.showToast('Email verified successfully', 'success');
    } catch (error: any) {
      toast.showToast(error.message || 'Verification failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Email Verified</Text>
          <Text style={styles.subtitle}>Your email has been verified successfully.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>Enter the verification token sent to your email</Text>

        <TextInput
          style={styles.input}
          placeholder="Verification Token"
          value={token}
          onChangeText={setToken}
        />

        <Pressable style={styles.button} onPress={handleVerify} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Verifying...' : 'Verify Email'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    width: '100%',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
