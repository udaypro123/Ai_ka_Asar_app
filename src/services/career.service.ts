import api from '../config/api';
import { CareerJourney, CareerMilestone } from '../types';

export const careerService = {
  getJourney: async (): Promise<CareerJourney> => {
    const response = await api.get('/career/journey');
    return response.data.data;
  },

  updateJourney: async (milestones: CareerMilestone[]): Promise<CareerJourney> => {
    const response = await api.patch('/career/journey', { milestones });
    return response.data.data;
  },

  getRecommendations: async () => {
    const response = await api.get('/career/recommendations');
    return response.data.data;
  },
};

export default careerService;
