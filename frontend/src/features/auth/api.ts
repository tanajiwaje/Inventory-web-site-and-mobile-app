type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    phone?: string;
    address?: string;
    companyName?: string;
    gstNumber?: string;
    supplierId?: string;
    customerId?: string;
  };
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
  request<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const updateProfile = (payload: Partial<LoginResponse['user']>) =>
  request<LoginResponse['user']>('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
