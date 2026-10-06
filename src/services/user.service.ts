import api from '../config/api';
import { env } from '../config/env';
import { User } from '../types';
import { Linking } from 'react-native';

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch('/users/me', data);
    return response.data.data;
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/users/me');
  },

  uploadResume: async (file: { uri: string; name: string; type: string }): Promise<{ resume: string; user: User }> => {
    const formData = new FormData();
    formData.append('resume', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
    const response = await api.post('/users/me/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  downloadResume: async (userId: string): Promise<void> => {
    const response = await api.get(`/users/${encodeURIComponent(userId)}/resume/download`);
    const downloadUrl = response.data.data?.downloadUrl;
    if (typeof downloadUrl !== 'string' || !downloadUrl) {
      throw new Error('The resume download link was not returned');
    }
    await Linking.openURL(new URL(downloadUrl, env.EXPO_PUBLIC_API_URL).toString());
  },
};

export default userService;
