import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from './Toast';
import { getApiErrorMessage } from '../../utils/apiError';

type RefreshHandler = () => Promise<void> | void;

interface PageRefreshContextValue {
  refreshing: boolean;
  refresh: () => Promise<void>;
  register: (handler: RefreshHandler) => () => void;
}

const PageRefreshContext = createContext<PageRefreshContextValue | null>(null);

export function PageRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshing, setRefreshing] = useState(false);
  const handlers = useRef(new Map<number, RefreshHandler>());
  const nextId = useRef(0);
  const { showToast } = useToast();

  const register = useCallback((handler: RefreshHandler) => {
    const id = nextId.current++;
    handlers.current.set(id, handler);
    return () => {
      handlers.current.delete(id);
    };
  }, []);

  const refresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const results = await Promise.allSettled(
        Array.from(handlers.current.values(), (handler) => Promise.resolve().then(handler))
      );
      const failure = results.find((result) => result.status === 'rejected');
      if (failure?.status === 'rejected') {
        showToast(getApiErrorMessage(failure.reason, 'Could not refresh this page'), 'error');
      }
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, showToast]);

  return (
    <PageRefreshContext.Provider value={{ refreshing, refresh, register }}>
      {children}
    </PageRefreshContext.Provider>
  );
}

export function usePageRefresh(handler: RefreshHandler) {
  const context = useContext(PageRefreshContext);

  useFocusEffect(
    useCallback(() => {
      if (!context) return undefined;
      return context.register(handler);
    }, [context, handler])
  );
}

export function usePageRefreshControl() {
  return useContext(PageRefreshContext);
}
