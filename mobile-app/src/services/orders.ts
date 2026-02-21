import { requestWithAuth } from './api';
import { Paginated, PurchaseOrder, SalesOrder } from '../types';

export const getPurchaseOrders = (token: string, params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestWithAuth<Paginated<PurchaseOrder>>(`/api/purchase-orders${suffix}`, token);
};

export const createPurchaseOrder = (token: string, payload: Record<string, unknown>) =>
  requestWithAuth<PurchaseOrder>('/api/purchase-orders', token, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const updatePurchaseOrder = (token: string, id: string, payload: Record<string, unknown>) =>
  requestWithAuth<PurchaseOrder>(`/api/purchase-orders/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

export const getSalesOrders = (token: string, params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestWithAuth<Paginated<SalesOrder>>(`/api/sales-orders${suffix}`, token);
};

export const createSalesOrder = (token: string, payload: Record<string, unknown>) =>
  requestWithAuth<SalesOrder>('/api/sales-orders', token, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const updateSalesOrder = (token: string, id: string, payload: Record<string, unknown>) =>
  requestWithAuth<SalesOrder>(`/api/sales-orders/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
