export const EMPLOYMENT_STATUS = [
  'Employed',
  'Self-employed',
  'Freelancer',
  'Student',
  'Looking for work',
  'Unemployed',
  'Career transition',
] as const;

export const AI_IMPACT_STATUS = [
  'No noticeable impact',
  'My tasks changed',
  'My workload decreased',
  'My income decreased',
  'My responsibilities changed',
  'My job is at risk',
  'I lost my job',
  'I changed my profession',
  'AI is helping me become more productive',
] as const;

export const IMPACT_AREAS = [
  'Coding',
  'Writing',
  'Design',
  'Research',
  'Customer Support',
  'Marketing',
  'Accounting',
  'Legal',
  'Education',
  'Sales',
  'Data Entry',
  'Analysis',
  'Other',
] as const;

export const CAREER_MILESTONES = [
  { key: 'assessment', label: 'Assessment' },
  { key: 'skill-gap', label: 'Skill Gap' },
  { key: 'learning', label: 'Learning' },
  { key: 'project', label: 'Project' },
  { key: 'applications', label: 'Applications' },
  { key: 'interview', label: 'Interview' },
  { key: 'transition', label: 'Career Transition' },
] as const;
