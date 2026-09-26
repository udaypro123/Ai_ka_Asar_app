import api from '../config/api';
import { AdminStats, RecentActivity, User } from '../types';

export const adminService = {
  getDashboardStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data.data;
  },

  getRecentActivity: async (): Promise<RecentActivity[]> => {
    const response = await api.get('/admin/recent-activity');
    return response.data.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data.data;
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  setUserBlockedStatus: async (userId: string, isBlocked: boolean): Promise<Pick<User, '_id' | 'isBlocked'>> => {
    const response = await api.put(`/admin/users/${userId}/block`, { isBlocked });
    return response.data.data;
  },
};

export default adminService;
