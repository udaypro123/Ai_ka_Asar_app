type LoadingListener = (isLoading: boolean) => void;

let activeRequests = 0;
const listeners = new Set<LoadingListener>();

const notifyListeners = () => {
  const isLoading = activeRequests > 0;
  listeners.forEach((listener) => listener(isLoading));
};

export const apiLoading = {
  start: () => {
    activeRequests += 1;
    notifyListeners();
  },
  finish: () => {
    activeRequests = Math.max(0, activeRequests - 1);
    notifyListeners();
  },
  subscribe: (listener: LoadingListener) => {
    listeners.add(listener);
    listener(activeRequests > 0);
    return () => {
      listeners.delete(listener);
    };
  },
};