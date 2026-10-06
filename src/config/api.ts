import { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, create } from 'axios';
import { env } from './env';
import { storage } from '../utils/storage';
import { apiLoading } from '../utils/apiLoading';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipGlobalLoader?: boolean;
  }
}

const API_BASE_URL = env.EXPO_PUBLIC_API_URL;
const refreshClient = create({
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

const apiClient: AxiosInstance = create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

type RetriableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _loaderTracked?: boolean;
  skipGlobalLoader?: boolean;
};
let refreshRequest: Promise<string> | null = null;

const refreshAccessToken = (): Promise<string> => {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      const refreshToken = await storage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await refreshClient.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: rotatedRefreshToken } = response.data.data;
      if (typeof accessToken !== 'string' || typeof rotatedRefreshToken !== 'string') {
        throw new Error('Invalid refresh response');
      }
      await storage.setAuthTokens(accessToken, rotatedRefreshToken);
      return accessToken;
    })().finally(() => {
      refreshRequest = null;
    });
  }
  return refreshRequest;
};

apiClient.interceptors.request.use(async (config) => {
  const accessToken = await storage.getItem('accessToken');
  if (accessToken) config.headers.set('Authorization', `Bearer ${accessToken}`);
  const trackedConfig = config as RetriableRequest;
  if (!trackedConfig.skipGlobalLoader && !trackedConfig._loaderTracked) {
    trackedConfig._loaderTracked = true;
    apiLoading.start();
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as RetriableRequest;
    if (config._loaderTracked) apiLoading.finish();
    return response;
  },
  async (error: AxiosResponse | any) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    const isAuthRequest = /\/auth\/(login|register|google|refresh|logout|forgot-password|reset-password|verify-email)/.test(
      originalRequest?.url ?? ''
    );
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
        return apiClient(originalRequest);
      } catch {
        await storage.clearAuthTokens().catch(() => undefined);
        if (originalRequest._loaderTracked) apiLoading.finish();
        return Promise.reject(error);
      }
    }
    if (originalRequest?._loaderTracked) apiLoading.finish();
    return Promise.reject(error);
  }
);

export default apiClient;
