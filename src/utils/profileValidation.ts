export interface RequiredProfileValues {
  name?: string;
  country?: string;
  experience?: string;
  currentRole?: string;
  previousRole?: string;
  previousCompany?: string;
  company?: string;
  jobDescription?: string;
  skills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  resume?: string;
}

type RequiredStringField = Exclude<keyof RequiredProfileValues, 'skills'>;

const requiredStringFields: Array<[RequiredStringField, string]> = [
  ['name', 'Full name'],
  ['country', 'Country'],
  ['experience', 'Experience'],
  ['currentRole', 'Current role'],
  ['previousRole', 'Previous role'],
  ['previousCompany', 'Previous company'],
  ['company', 'Company'],
  ['jobDescription', 'Job description'],
  ['linkedinUrl', 'LinkedIn URL'],
  ['githubUrl', 'GitHub URL'],
  ['resume', 'Resume'],
];

const isValidWebUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

export const getProfileValidationError = (profile: RequiredProfileValues): string | null => {
  const missingFields = requiredStringFields
    .filter(([field]) => !profile[field]?.trim())
    .map(([, label]) => label);

  if (!profile.skills?.some((skill) => skill.trim())) {
    missingFields.push('Skills');
  }

  if (missingFields.length > 0) {
    return `Please complete all required fields: ${missingFields.join(', ')}.`;
  }

  const invalidUrls = ([
    ['linkedinUrl', 'LinkedIn URL'],
    ['githubUrl', 'GitHub URL'],
  ] as const)
    .filter(([field]) => !isValidWebUrl(profile[field]!.trim()))
    .map(([, label]) => label);

  if (invalidUrls.length > 0) {
    return `Please enter a valid HTTP or HTTPS URL for: ${invalidUrls.join(', ')}.`;
  }

  return null;
};
