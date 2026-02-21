import { AuditLog, Paginated } from '../../shared/types';

const getBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:4000';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options?.headers ?? {})
    },
    ...options
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Request failed');
  }

  return (await res.json()) as T;
};

export const getAuditLogs = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<Paginated<AuditLog>>(`/api/audit-logs${suffix}`);
};
