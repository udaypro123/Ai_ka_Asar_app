import api from '../config/api';
import { ImpactReport, ImpactHistory } from '../types';

export const impactService = {
  createReport: async (data: Partial<ImpactReport>): Promise<ImpactReport> => {
    const response = await api.post('/impact', data);
    return response.data.data;
  },

  getMyReports: async (): Promise<ImpactReport[]> => {
    const response = await api.get('/impact/me');
    return response.data.data;
  },

  getHistory: async (): Promise<ImpactHistory[]> => {
    const response = await api.get('/impact/history');
    return response.data.data;
  },
};

export default impactService;
