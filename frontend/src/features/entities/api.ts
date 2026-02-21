import {
  Customer,
  CustomerPayload,
  Location,
  LocationPayload,
  Paginated,
  PurchaseOrder,
  PurchaseOrderPayload,
  ReturnEntry,
  ReturnPayload,
  SalesOrder,
  SalesOrderPayload,
  Supplier,
  SupplierPayload
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

const requestBlob = async (path: string, options?: RequestInit): Promise<Blob> => {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: {
      ...getAuthHeader(),
      ...(options?.headers ?? {})
    },
    ...options
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Request failed');
  }

  return res.blob();
};

export const getSuppliers = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<Paginated<Supplier>>(`/api/suppliers${suffix}`);
};
export const createSupplier = (payload: SupplierPayload) =>
  request<Supplier>('/api/suppliers', { method: 'POST', body: JSON.stringify(payload) });
export const updateSupplier = (id: string, payload: SupplierPayload) =>
  request<Supplier>(`/api/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteSupplier = (id: string) =>
  request<void>(`/api/suppliers/${id}`, { method: 'DELETE' });

export const getCustomers = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<Paginated<Customer>>(`/api/customers${suffix}`);
};
export const createCustomer = (payload: CustomerPayload) =>
  request<Customer>('/api/customers', { method: 'POST', body: JSON.stringify(payload) });
export const updateCustomer = (id: string, payload: CustomerPayload) =>
  request<Customer>(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteCustomer = (id: string) =>
  request<void>(`/api/customers/${id}`, { method: 'DELETE' });

export const getLocations = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<Paginated<Location>>(`/api/locations${suffix}`);
};
export const createLocation = (payload: LocationPayload) =>
  request<Location>('/api/locations', { method: 'POST', body: JSON.stringify(payload) });
export const updateLocation = (id: string, payload: LocationPayload) =>
  request<Location>(`/api/locations/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteLocation = (id: string) =>
  request<void>(`/api/locations/${id}`, { method: 'DELETE' });

export const getPurchaseOrders = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<Paginated<PurchaseOrder>>(`/api/purchase-orders${suffix}`);
};
export const createPurchaseOrder = (payload: PurchaseOrderPayload) =>
  request<PurchaseOrder>('/api/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
export const updatePurchaseOrder = (id: string, payload: Partial<PurchaseOrderPayload>) =>
  request<PurchaseOrder>(`/api/purchase-orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
export const deletePurchaseOrder = (id: string) =>
  request<void>(`/api/purchase-orders/${id}`, { method: 'DELETE' });
export const getPurchaseOrderPdf = (id: string) =>
  requestBlob(`/api/purchase-orders/${id}/pdf`);

export const getSalesOrders = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<Paginated<SalesOrder>>(`/api/sales-orders${suffix}`);
};
export const createSalesOrder = (payload: SalesOrderPayload) =>
  request<SalesOrder>('/api/sales-orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
export const updateSalesOrder = (id: string, payload: Partial<SalesOrderPayload>) =>
  request<SalesOrder>(`/api/sales-orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
export const deleteSalesOrder = (id: string) =>
  request<void>(`/api/sales-orders/${id}`, { method: 'DELETE' });
export const getSalesOrderPdf = (id: string) =>
  requestBlob(`/api/sales-orders/${id}/pdf`);

export const getReturns = (params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<Paginated<ReturnEntry>>(`/api/returns${suffix}`);
};
export const createReturn = (payload: ReturnPayload) =>
  request<ReturnEntry>('/api/returns', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
export const updateReturn = (id: string, payload: Partial<ReturnPayload>) =>
  request<ReturnEntry>(`/api/returns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
export const deleteReturn = (id: string) =>
  request<void>(`/api/returns/${id}`, { method: 'DELETE' });
