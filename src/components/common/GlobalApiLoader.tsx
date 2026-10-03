import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { apiLoading } from '../../utils/apiLoading';
import { colors } from '../../theme';

export function GlobalApiLoader() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => apiLoading.subscribe(setIsLoading), []);

  if (!isLoading) return null;

  return (
    <View style={styles.overlay} accessibilityRole="progressbar" accessibilityLabel="Loading">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10000,
    elevation: 10000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
  },
});