export type AuthStackParamList = {
  login: undefined;
  register: undefined;
  'forgot-password': undefined;
  'reset-password': undefined;
  'verify-email': undefined;
};

export type OnboardingStackParamList = {
  welcome: undefined;
  profession: undefined;
  'career-profile': undefined;
  assessment: undefined;
};

export type TabsStackParamList = {
  index: undefined;
  impact: undefined;
  career: undefined;
  skills: undefined;
  profile: undefined;
};

export type RootStackParamList = {
  index: undefined;
  '(auth)': undefined;
  '(onboarding)': undefined;
  '(tabs)': undefined;
};

export type AuthNavigation = any;
export type OnboardingNavigation = any;
export type TabsNavigation = any;
export type RootNavigation = any;

export type AuthRoute = any;
export type OnboardingRoute = any;
export type TabsRoute = any;
export type RootRoute = any;
