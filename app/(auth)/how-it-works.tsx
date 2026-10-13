import { useNavigation } from '@react-navigation/native';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { borderRadius, colors, spacing, typography } from '../../src/theme';

const steps = [
  {
    icon: 'person-add-outline',
    title: '1. Create your account',
    description:
      'Sign up with your email or Google account. Choose the account type that best describes you.',
  },
  {
    icon: 'clipboard-outline',
    title: '2. Tell us about your work',
    description:
      'Complete the onboarding assessment and share your role, experience, and skills so AIMarg can understand your career context.',
  },
  {
    icon: 'analytics-outline',
    title: '3. Understand your AI impact',
    description:
      'Explore your impact information and career dashboard to understand how AI may affect your work and where you can focus next.',
  },
  {
    icon: 'trending-up-outline',
    title: '4. Build your next steps',
    description:
      'Review skill and career resources, identify areas to develop, and track progress toward your career goals.',
  },
  {
    icon: 'people-outline',
    title: '5. Learn with the community',
    description:
      'Connect with other members, share experiences, and take part in career-focused discussions.',
  },
];

export default function HowItWorksScreen() {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={[colors.auth.bgStart, '#eef5ff', colors.white]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Text style={styles.eyebrow}>AIMARG CAREER COMPANION</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close and return to login"
              hitSlop={10}
              onPress={() => navigation.goBack()}
              style={styles.closeIconButton}
            >
              <Ionicons name="close" size={24} color={colors.gray700} />
            </Pressable>
          </View>

          <View style={styles.hero}>
            <Image
              source={require('../../assets/icon3.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="AIMarg logo"
            />
            <Text style={styles.title}>Know how the app works</Text>
            <Text style={styles.subtitle}>
              AIMarg helps you understand AI’s impact on your career, find areas
              to grow, and plan your next steps.
            </Text>
          </View>

          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons name="compass-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.introText}>
              <Text style={styles.introTitle}>What is AIMarg for?</Text>
              <Text style={styles.bodyText}>
                Use your profile and career information to explore your AI
                impact, career resources, skills, and progress in one place.
                You stay in control of your profile and privacy settings.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Your journey with AIMarg</Text>
          <View style={styles.steps}>
            {steps.map((step, index) => (
              <View key={step.title} style={styles.stepRow}>
                <View style={styles.stepIconWrap}>
                  <Ionicons
                    name={step.icon}
                    size={21}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.bodyText}>{step.description}</Text>
                </View>
                {index < steps.length - 1 && <View style={styles.connector} />}
              </View>
            ))}
          </View>

          <View style={styles.privacyCard}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.secondaryDark} />
            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>Your account, your choices</Text>
              <Text style={styles.bodyText}>
                Update your profile and notification preferences in settings.
                Only share information you are comfortable adding to your
                account.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={19} color={colors.white} />
            <Text style={styles.closeButtonText}>Close and return to login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  topRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  eyebrow: {
    color: colors.primaryDark,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  closeIconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  hero: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  logo: {
    width: 112,
    height: 112,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.gray900,
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.gray600,
    fontSize: typography.fontSize.base,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  introCard: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.gray100,
    marginBottom: spacing.xl,
  },
  introIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  introText: {
    flex: 1,
  },
  introTitle: {
    color: colors.gray900,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  bodyText: {
    color: colors.gray600,
    fontSize: typography.fontSize.sm,
    lineHeight: 21,
  },
  sectionTitle: {
    color: colors.gray900,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  steps: {
    marginBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    position: 'relative',
    paddingBottom: spacing.lg,
  },
  stepIconWrap: {
    zIndex: 1,
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  connector: {
    position: 'absolute',
    left: 20,
    top: 42,
    bottom: 0,
    width: 1,
    backgroundColor: colors.gray300,
  },
  stepContent: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  stepTitle: {
    color: colors.gray900,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  privacyCard: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: '#ecfdf5',
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
  },
  privacyText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  privacyTitle: {
    color: colors.gray900,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  closeButton: {
    minHeight: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  pressed: {
    opacity: 0.82,
  },
});
