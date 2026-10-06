import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface AimargLoaderProps {
  message?: string;
  compact?: boolean;
}

export function AimargLoader({
  message = 'Finding your community',
  compact = false,
}: AimargLoaderProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const orbit = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 950,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 950,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    const orbitAnimation = Animated.loop(
      Animated.timing(orbit, {
        toValue: 1,
        duration: 2600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    orbitAnimation.start();
    return () => {
      pulseAnimation.stop();
      orbitAnimation.stop();
    };
  }, [orbit, pulse]);

  const rotation = orbit.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.06],
  });
  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.3],
  });

  return (
    <View
      style={[styles.container, compact && styles.compactContainer]}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <View style={[styles.artwork, compact && styles.compactArtwork]}>
        <Animated.View
          style={[
            styles.glow,
            compact && styles.compactGlow,
            { opacity: glowOpacity, transform: [{ scale }] },
          ]}
        />
        <Animated.View
          style={[
            styles.orbit,
            compact && styles.compactOrbit,
            { transform: [{ rotate: rotation }] },
          ]}
        >
          <View style={[styles.orbitDot, compact && styles.compactOrbitDot]} />
        </Animated.View>
        <Animated.View style={[styles.logoFrame, compact && styles.compactLogoFrame, { transform: [{ scale }] }]}>
          <Image
            source={require('../../../assets/icon3.png')}
            style={[styles.logo, compact && styles.compactLogo]}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
      {!compact && (
        <>
          <Text style={styles.title}>{message}</Text>
          <Text style={styles.subtitle}>Building a stronger future, together</Text>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { opacity: glowOpacity.interpolate({
              inputRange: [0.12, 0.3],
              outputRange: [0.65, 1],
            }) }]} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  artwork: {
    width: 152,
    height: 152,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  glow: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primaryLight,
  },
  orbit: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  orbitDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.white,
  },
  logoFrame: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  logo: { width: 64, height: 64 },
  title: {
    color: colors.auth.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    color: colors.auth.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  progressTrack: {
    width: 116,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  progressFill: {
    width: '65%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  compactContainer: { minHeight: 0, paddingVertical: 0 },
  compactArtwork: { width: 42, height: 42, marginBottom: 0 },
  compactGlow: { width: 34, height: 34, borderRadius: 17 },
  compactOrbit: { ...StyleSheet.absoluteFill },
  compactOrbitDot: { width: 7, height: 7, borderRadius: 4 },
  compactLogoFrame: { width: 30, height: 30, borderRadius: 15, elevation: 1 },
  compactLogo: { width: 24, height: 24 },
});
