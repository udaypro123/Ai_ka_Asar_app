import api from '../config/api';
import { Profession } from '../types';

export const professionService = {
  getAll: async (): Promise<Profession[]> => {
    const response = await api.get('/professions');
    return response.data.data;
  },
};

export default professionService;
