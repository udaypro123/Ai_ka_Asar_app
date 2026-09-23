export interface User {
  _id: string;
  name: string;
  email: string;
  country?: string;
  profession?: string;
  industry?: string;
  experience?: string;
  employmentStatus?: string;
  skills?: string[];
  careerGoal?: string;
  aiUsage?: string;
  aiImpactStatus?: string;
  isEmailVerified: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  _id: string;
  name: string;
  permissions: string[];
}

export interface Profession {
  _id: string;
  name: string;
  category: string;
  description: string;
}

export interface ImpactReport {
  _id: string;
  userId: string;
  professionId: string;
  employmentStatus: string;
  impactStatus: string;
  impactAreas: string[];
  incomeImpact: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImpactHistory {
  _id: string;
  userId: string;
  reportId: string;
  status: string;
  areas: string[];
  createdAt: string;
}

export interface Skill {
  _id: string;
  name: string;
  category: string;
  description: string;
}

export interface SkillGap {
  skill: Skill;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
}

export interface Assessment {
  _id: string;
  userId: string;
  responses: Record<string, any>;
  score?: number;
  recommendations?: string[];
  createdAt: string;
}

export interface CareerMilestone {
  key: string;
  label: string;
  completed: boolean;
  completedAt?: string;
}

export interface CareerJourney {
  _id: string;
  userId: string;
  milestones: CareerMilestone[];
  currentMilestone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}
