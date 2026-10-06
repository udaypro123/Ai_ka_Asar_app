import axios from 'axios';

const FALLBACK_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export const getApiErrorMessage = (
  error: unknown,
  fallback = FALLBACK_ERROR_MESSAGE
): string => {
  if (typeof error === 'string' && error.trim()) return error;

  if (axios.isAxiosError(error)) {
    const responseData: unknown = error.response?.data;
    if (responseData && typeof responseData === 'object') {
      const data = responseData as {
        message?: unknown;
        error?: unknown;
        code?: unknown;
        errors?: unknown;
      };
      if (data.code === 'GOOGLE_AUTH_NOT_CONFIGURED') {
        return "Google sign-in isn't configured on the server. Add this app's Google OAuth client ID to GOOGLE_CLIENT_IDS in AIMarg_backend/.env, then restart the API.";
      }
      if (typeof data.message === 'string' && data.message.trim()) return data.message;
      if (typeof data.error === 'string' && data.error.trim()) return data.error;
      if (Array.isArray(data.errors)) {
        const firstError = data.errors.find(
          (item): item is string =>
            typeof item === 'string' && item.trim().length > 0
        );
        if (firstError) return firstError;
      }
    }

    if (error.message && !/^request failed with status code \d+$/i.test(error.message)) {
      return error.message;
    }
    return fallback;
  }

  return error instanceof Error && error.message ? error.message : fallback;
};
