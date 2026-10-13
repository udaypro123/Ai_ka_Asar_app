import type { User } from '../types';

export const getPostAuthRoute = (user: User, isNewUser = false): string => {
  if (user.roles?.some((role) => role === 'ADMIN' || role === 'SUPER_ADMIN')) {
    return '(admin)';
  }
  if (user.roles?.includes('HR')) {
    return '(hr)';
  }
  return isNewUser ? '(onboarding)' : '(tabs)';
};
