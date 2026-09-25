import api from '../config/api';
import { User } from '../types';

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch('/users/me', data);
    return response.data.data;
  },

  uploadResume: async (file: any): Promise<{ resume: string }> => {
    console.log('[userService] uploadResume called with:', file);
    const formData = new FormData();
    formData.append('resume', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
    console.log('[userService] FormData created, sending to /users/me/resume');
    const response = await api.post('/users/me/resume', formData);
    console.log('[userService] resume upload response:', response.data);
    return response.data.data;
  },
};

export default userService;
