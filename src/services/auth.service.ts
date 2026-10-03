import api from '../config/api';
import { User } from '../types';
import { storage } from '../utils/storage';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  googleLogin: async (idToken: string): Promise<AuthResponse & { isNewUser: boolean }> => {
    const response = await api.post('/auth/google', { idToken });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = await storage.getItem('refreshToken');
    if (refreshToken) await api.post('/auth/logout', { refreshToken });
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password });
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },

  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data.data;
  },
};

export default authService;
