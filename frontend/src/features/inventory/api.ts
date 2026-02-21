import {
  InventoryAdjustmentPayload,
  InventoryItem,
  InventoryPayload,
  InventoryStock,
  InventoryTransaction,
  Paginated,
  ReportSummary,
  ReportValuation
} from '../../shared/types';

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

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
};

export const getItems = (params?: {
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  if (params?.lowStock) query.set('lowStock', 'true');
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<Paginated<InventoryItem>>(`/api/inventory${suffix}`);
};

export const createItem = (payload: InventoryPayload) =>
  request<InventoryItem>('/api/inventory', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const updateItem = (id: string, payload: InventoryPayload) =>
  request<InventoryItem>(`/api/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

export const deleteItem = (id: string) =>
  request<void>(`/api/inventory/${id}`, {
    method: 'DELETE'
  });

export const adjustStock = (payload: InventoryAdjustmentPayload) =>
  request<{ item: InventoryItem; transaction: InventoryTransaction }>(
    '/api/inventory/adjust',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );

export const getTransactions = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<Paginated<InventoryTransaction>>(`/api/inventory/transactions${suffix}`);
};

export const getReportSummary = () =>
  request<ReportSummary>('/api/inventory/report/summary');

export const getReportValuation = () =>
  request<ReportValuation>('/api/inventory/report/valuation');

export const getStocks = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<Paginated<InventoryStock>>(`/api/inventory/stocks${suffix}`);
};

export const exportItemsCsv = async () => {
  const res = await fetch(`${getBaseUrl()}/api/inventory/export`, {
    headers: {
      ...getAuthHeader()
    }
  });
  if (!res.ok) throw new Error('Export failed');
  return res.text();
};

export const importItemsCsv = async (file: File) => {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${getBaseUrl()}/api/inventory/import`, {
    method: 'POST',
    headers: {
      ...getAuthHeader()
    },
    body: form
  });
  if (!res.ok) throw new Error('Import failed');
  return res.json();
};
