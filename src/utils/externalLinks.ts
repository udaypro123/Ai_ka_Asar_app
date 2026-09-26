import { Linking } from 'react-native';

export function safeExternalUrl(value?: string): string | null {
  const input = value?.trim();
  if (!input) return null;

  try {
    const normalized = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    const url = new URL(normalized);
    if (!url.hostname || url.username || url.password) return null;
    if (url.protocol === 'http:') {
      return new URL(`https://${url.host}${url.pathname}${url.search}${url.hash}`).toString();
    }
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function openExternalUrl(value?: string): Promise<void> {
  const url = safeExternalUrl(value);
  if (!url) return;
  try {
    await Linking.openURL(url);
  } catch {
    return;
  }
}
