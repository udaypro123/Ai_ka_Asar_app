import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useNavigation } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigation = useNavigation();

  const steps = [
    {
      title: 'Welcome to AI Ka Asar',
      description: 'Understand how AI is changing your work and discover your next career step.',
      icon: '👋',
    },
    {
      title: 'Understand your AI impact',
      description: 'Track how artificial intelligence is affecting your job, skills, and income.',
      icon: '📊',
    },
    {
      title: 'Identify your skill gaps',
      description: 'See which skills you need to adapt and get personalized learning paths.',
      icon: '🎯',
    },
    {
      title: 'Track your career transition',
      description: 'Follow your journey from assessment to career recovery and growth.',
      icon: '🚀',
    },
    {
      title: 'Protect your privacy',
      description: 'Your data stays private. We use aggregated insights to help everyone.',
      icon: '🔒',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.replace('(auth)');
    }
  };

  const handleSkip = () => {
    navigation.replace('(auth)');
  };

  return (
    <LinearGradient
      colors={[colors.auth.bgStart, colors.auth.bgEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{steps[currentStep].icon}</Text>
        <Text style={styles.title}>{steps[currentStep].title}</Text>
        <Text style={styles.description}>{steps[currentStep].description}</Text>

        <View style={styles.dots}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentStep && styles.activeDot]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.auth.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.auth.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.auth.cardBorder,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  skipText: {
    color: colors.auth.textSecondary,
    fontSize: typography.fontSize.base,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  nextText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
