import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { apiLoading } from '../../utils/apiLoading';

export function GlobalApiLoader() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => apiLoading.subscribe(setIsLoading), []);

  if (!isLoading) return null;

  return (
    <View style={styles.overlay} accessibilityRole="progressbar" accessibilityLabel="Loading">
      <Image source={require('../../../assets/aimarg.gif')} style={styles.image} contentFit="contain" />
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
  image: {
    width: 156,
    height: 156,
  },
});