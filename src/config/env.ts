import Config from 'react-native-config';

const apiUrl =
  Config.API_URL ||
  Config.EXPO_PUBLIC_API_URL ||
  'http://localhost:5000/api/v1';
const parsedApiUrl = new URL(apiUrl);

if (!['http:', 'https:'].includes(parsedApiUrl.protocol)) {
  throw new Error('API_URL must use HTTP or HTTPS');
}

if (!__DEV__ && parsedApiUrl.protocol !== 'https:') {
  throw new Error('Production builds require an HTTPS API URL');
}

export const env = {
  EXPO_PUBLIC_API_URL: parsedApiUrl.toString().replace(/\/$/, ''),
  GOOGLE_WEB_CLIENT_ID:
    Config.GOOGLE_WEB_CLIENT_ID || Config.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  GOOGLE_ANDROID_CLIENT_ID:
    Config.GOOGLE_ANDROID_CLIENT_ID || Config.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  GOOGLE_IOS_CLIENT_ID:
    Config.GOOGLE_IOS_CLIENT_ID || Config.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
};
