import { API_BASE_URL } from '../config';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  phone?: string;
  address?: string;
  companyName?: string;
  gstNumber?: string;
  supplierId?: string;
  customerId?: string;
};

type LoginResponse = {
  token: string;
  user: User;
};

export const request = async <T>(
  path: string,
  options?: RequestInit,
  token?: string | null
): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export const requestWithAuth = async <T>(
  path: string,
  token: string,
  options?: RequestInit
): Promise<T> => request<T>(path, options, token);

export const login = (email: string, password: string) =>
  request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

export const register = (payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  address?: string;
  companyName?: string;
  gstNumber?: string;
}) =>
  request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const getMe = (token: string) =>
  request<User>('/api/auth/me', { method: 'GET' }, token);

export const updateMe = (token: string, payload: Partial<User>) =>
  request<User>('/api/auth/me', { method: 'PATCH', body: JSON.stringify(payload) }, token);
