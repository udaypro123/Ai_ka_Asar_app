import Config from 'react-native-config';

const configuredApiUrl = Config.EXPO_PUBLIC_API_URL || Config.API_URL;

if (!configuredApiUrl && !__DEV__) {
  throw new Error('EXPO_PUBLIC_API_URL must be set for production builds');
}

const apiUrl = configuredApiUrl || 'http://localhost:5000/api/v1';
const parsedApiUrl = new URL(apiUrl);

if (!['http:', 'https:'].includes(parsedApiUrl.protocol)) {
  throw new Error('EXPO_PUBLIC_API_URL must use HTTP or HTTPS');
}

if (!__DEV__ && parsedApiUrl.protocol !== 'https:') {
  throw new Error('Production builds require EXPO_PUBLIC_API_URL to use HTTPS');
}

export const env = {
  EXPO_PUBLIC_API_URL: parsedApiUrl.toString().replace(/\/$/, ''),
  GOOGLE_WEB_CLIENT_ID:
    Config.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || Config.GOOGLE_WEB_CLIENT_ID || '',
  GOOGLE_ANDROID_CLIENT_ID:
    Config.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || Config.GOOGLE_ANDROID_CLIENT_ID || '',
  GOOGLE_IOS_CLIENT_ID:
    Config.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || Config.GOOGLE_IOS_CLIENT_ID || '',
};
