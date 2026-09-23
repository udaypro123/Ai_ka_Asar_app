import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../../theme';

interface AuthContainerProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthContainer({ title, subtitle, children }: AuthContainerProps) {
  return (
    <LinearGradient
      colors={[colors.auth.bgStart, colors.auth.bgEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <View style={styles.background}>
        <View style={styles.circleTop} />
        <View style={styles.circleBottom} />
        <View style={styles.content}>{children}</View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  circleTop: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#1e3a8a',
    top: -120,
    right: -100,
    opacity: 0.65,
  },
  circleBottom: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#1d4ed8',
    bottom: -90,
    left: -70,
    opacity: 0.45,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
});
