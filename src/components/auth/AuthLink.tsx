import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface AuthLinkProps {
  text: string;
  linkText: string;
  onPress: () => void;
}

export function AuthLink({ text, linkText, onPress }: AuthLinkProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {text}{' '}
        <Text style={styles.link} onPress={onPress}>
          {linkText}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  text: {
    color: colors.black,
    fontSize: typography.fontSize.sm,
  },
  link: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});
