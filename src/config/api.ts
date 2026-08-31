export const API_ROOT = 'https://allapps.alphaciment.com/crm_back';
export const BASE_URL = `${API_ROOT}/api`;
// export const BASE_URL = 'http://10.192.193.246:8000/api';

export function normalizeMediaUrl(value?: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^(https?:\/\/|file:\/\/)/i.test(trimmed)) {
    const withCorrectHost = trimmed.replace(
      /^https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?/i,
      API_ROOT
    );
    return withCorrectHost;
  }

  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/')) return `${API_ROOT}${trimmed}`;

  return `${API_ROOT}/${trimmed.replace(/^\.?\//, '')}`;
}