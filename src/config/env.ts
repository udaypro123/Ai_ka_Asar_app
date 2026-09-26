const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const parsedApiUrl = new URL(apiUrl);

if (!['http:', 'https:'].includes(parsedApiUrl.protocol)) {
  throw new Error('EXPO_PUBLIC_API_URL must use HTTP or HTTPS');
}

if (process.env.NODE_ENV === 'production' && parsedApiUrl.protocol !== 'https:') {
  throw new Error('Production builds require an HTTPS API URL');
}

export const env = { EXPO_PUBLIC_API_URL: parsedApiUrl.toString().replace(/\/$/, '') };
