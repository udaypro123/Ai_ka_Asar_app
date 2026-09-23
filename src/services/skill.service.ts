import api from '../config/api';
import { Skill, SkillGap } from '../types';

export const skillService = {
  getAll: async (): Promise<Skill[]> => {
    const response = await api.get('/skills');
    return response.data.data;
  },

  getMySkills: async (): Promise<SkillGap[]> => {
    const response = await api.get('/skills/me');
    return response.data.data;
  },

  updateSkill: async (skillId: string, level: number): Promise<SkillGap> => {
    const response = await api.patch(`/skills/me/${skillId}`, { level });
    return response.data.data;
  },
};

export default skillService;
