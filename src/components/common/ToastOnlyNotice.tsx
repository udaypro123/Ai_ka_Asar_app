import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useToast } from './Toast';

export function ToastOnlyNotice({ message }: { message: string }) {
  const { showToast } = useToast();

  useEffect(() => {
    showToast(message, 'error');
  }, [message, showToast]);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
