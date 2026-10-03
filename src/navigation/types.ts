import type { NavigatorScreenParams } from '@react-navigation/native';

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

export type UserDrawerParamList = {
  index: undefined;
  community: undefined;
  impact: undefined;
  career: undefined;
  skills: undefined;
  profile: undefined;
  users: undefined;
  admin: undefined;
  userHome: undefined;
};

export type AdminDrawerParamList = {
  index: undefined;
  users: undefined;
  'user-detail': { userId: string } | undefined;
  profile: undefined;
};

export type HrDrawerParamList = {
  index: undefined;
  candidates: undefined;
  profile: undefined;
};

export type RootStackParamList = {
  Bootstrap: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList> | undefined;
  User: NavigatorScreenParams<UserDrawerParamList> | undefined;
  Admin: NavigatorScreenParams<AdminDrawerParamList> | undefined;
  HR: NavigatorScreenParams<HrDrawerParamList> | undefined;
};
