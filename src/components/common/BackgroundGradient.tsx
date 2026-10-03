import { colors } from '@/theme';
import LinearGradient from 'react-native-linear-gradient';
import { View, StyleSheet, ScrollView } from 'react-native';

interface BackgroundGradientProps {
  children: React.ReactNode;
}

export function BackgroundGradient({ children }: BackgroundGradientProps) {
  return (
    <LinearGradient
      colors={[colors.auth.bgStart, colors.auth.bgEnd]}
      start={{ x: 5, y: 5 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {children}
    </LinearGradient>
  );
}

export function GradientScrollView({ children, ...props }: any) {
  return (
    <BackgroundGradient>
      <ScrollView {...props} style={{ flex: 1 }}>
        {children}
      </ScrollView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
