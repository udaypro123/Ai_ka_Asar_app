import { CommonActions, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useCallback } from 'react';
import { navigationRef } from './navigationRef';
import type { RootStackParamList } from './types';

type NavigatorName = Exclude<keyof RootStackParamList, 'Bootstrap'>;
type RouteTarget = {
  navigator: NavigatorName;
  screen: string;
  params?: Record<string, string>;
};

function resolveRoute(path: string): RouteTarget {
  const [pathname, query = ''] = path.split('?');
  const segments = new URLSearchParams(query);
  const normalized = pathname.replace(/^\/+|\/+$/g, '');
  const parts = normalized.split('/').filter(Boolean);
  const group = parts[0]?.replace(/^\(|\)$/g, '');
  const screen = parts[1] ?? '';

  if (group === 'auth') {
    return { navigator: 'Auth', screen: screen || 'login' };
  }
  if (group === 'onboarding') {
    return { navigator: 'Onboarding', screen: screen || 'welcome' };
  }
  if (group === 'admin') {
    const params = segments.get('userId');
    return {
      navigator: 'Admin',
      screen: screen || 'index',
      ...(params ? { params: { userId: params } } : {}),
    };
  }
  if (group === 'hr') {
    return { navigator: 'HR', screen: screen || 'index' };
  }
  if (group === 'user') {
    return { navigator: 'User', screen: 'userHome' };
  }
  if (group === 'tabs') {
    return { navigator: 'User', screen: screen || 'index' };
  }
  if (normalized === '(admin)') {
    return { navigator: 'Admin', screen: 'index' };
  }
  if (normalized === '(hr)') {
    return { navigator: 'HR', screen: 'index' };
  }
  if (normalized === '(onboarding)') {
    return { navigator: 'Onboarding', screen: 'welcome' };
  }
  if (normalized === '(tabs)') {
    return { navigator: 'User', screen: 'index' };
  }

  return { navigator: 'Auth', screen: 'login' };
}

function dispatchRoute(path: string, replace: boolean): void {
  if (!navigationRef.isReady()) return;

  const target = resolveRoute(path);
  const route = {
    name: target.navigator,
    params: {
      screen: target.screen,
      ...(target.params ? { params: target.params } : {}),
    },
  };

  if (replace) {
    navigationRef.dispatch(
      CommonActions.reset({ index: 0, routes: [route] } as never)
    );
  } else {
    navigationRef.navigate(route as never);
  }
}

export function useAppRouter() {
  const navigate = useCallback((path: string) => dispatchRoute(path, false), []);
  const replace = useCallback((path: string) => dispatchRoute(path, true), []);
  const push = useCallback((path: string) => dispatchRoute(path, false), []);

  return { navigate, replace, push };
}

export function useLocalSearchParams<T extends object>(): T {
  const route = useRoute<RouteProp<Record<string, T>, string>>();
  return (route.params ?? {}) as T;
}
