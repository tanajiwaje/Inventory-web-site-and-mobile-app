import { AdminDashboard, CompanySettings, Paginated } from '../../shared/types';

type PendingUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  address?: string;
  companyName?: string;
  gstNumber?: string;
  createdAt?: string;
};

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

export const getPendingUsers = () => request<PendingUser[]>('/api/users/pending');
export const approveUser = (id: string) =>
  request(`/api/users/${id}/approve`, { method: 'POST' });
export const rejectUser = (id: string) =>
  request(`/api/users/${id}/reject`, { method: 'POST' });
export const getAdminDashboard = () => request<AdminDashboard>('/api/reports/dashboard');
export const getCompanySettings = () => request<CompanySettings>('/api/company');
export const updateCompanySettings = (payload: Partial<CompanySettings>) =>
  request<CompanySettings>('/api/company', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
