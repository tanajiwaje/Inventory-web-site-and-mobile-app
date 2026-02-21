export const getApiBaseUrl = () =>
  (window as unknown as { __env?: { VITE_API_BASE_URL?: string } }).__env?.VITE_API_BASE_URL ||
  'http://localhost:4000';

export const toQuery = (params?: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams();
  if (!params) return '';
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, String(value));
  });
  const output = query.toString();
  return output ? `?${output}` : '';
};
