import { colors } from '@/theme';
import LinearGradient from 'react-native-linear-gradient';
import { RefreshControl, StyleSheet, ScrollView, type ScrollViewProps } from 'react-native';
import { usePageRefreshControl } from './PageRefresh';

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

interface GradientScrollViewProps extends ScrollViewProps {
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function GradientScrollView({
  children,
  refreshing: localRefreshing,
  onRefresh: localOnRefresh,
  ...props
}: GradientScrollViewProps) {
  const pageRefresh = usePageRefreshControl();
  const refreshing = localRefreshing ?? pageRefresh?.refreshing ?? false;
  const onRefresh = localOnRefresh ?? pageRefresh?.refresh;

  return (
    <BackgroundGradient>
      <ScrollView
        {...props}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} /> : undefined
        }
        style={[{ flex: 1 }, props.style]}
      >
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
