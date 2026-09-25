import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '../src/theme';
import { InteractionManager } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          router.replace('index');
        }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/aimarg.gif')}
        style={styles.gif}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gif: {
    width: width * 0.8,
    height: height * 0.6,
  },
});
