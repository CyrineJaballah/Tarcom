const DEFAULT_API_BASE_URL = 'http://localhost:8080/api';

export function getApiBaseUrl(rawBaseUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL): string {
  const baseUrl = rawBaseUrl?.trim();

  if (!baseUrl) {
    return DEFAULT_API_BASE_URL;
  }

  const normalized = baseUrl.replace(/\/+$/, '');

  if (normalized === '/api' || normalized.endsWith('/api')) {
    return normalized;
  }

  return `${normalized}/api`;
}

