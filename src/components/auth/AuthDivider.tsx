import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../../theme';

export function AuthDivider() {
  return (
    <View style={styles.container} accessibilityLabel="or">
      <View style={styles.line} />
      <Text style={styles.label}>OR</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#cbd5e1',
  },
  label: {
    color: '#64748b',
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
});
