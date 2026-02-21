import { requestWithAuth } from './api';
import {
  InventoryAdjustmentPayload,
  InventoryItem,
  InventoryPayload,
  InventoryStock,
  InventoryTransaction,
  Paginated
} from '../types';

export const getInventoryItems = (
  token: string,
  params?: { page?: number; limit?: number; search?: string; category?: string; lowStock?: boolean }
) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  if (params?.lowStock) query.set('lowStock', 'true');
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestWithAuth<Paginated<InventoryItem>>(`/api/inventory${suffix}`, token);
};

export const createInventoryItem = (token: string, payload: InventoryPayload) =>
  requestWithAuth<InventoryItem>('/api/inventory', token, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const updateInventoryItem = (token: string, id: string, payload: InventoryPayload) =>
  requestWithAuth<InventoryItem>(`/api/inventory/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

export const deleteInventoryItem = (token: string, id: string) =>
  requestWithAuth<void>(`/api/inventory/${id}`, token, { method: 'DELETE' });

export const adjustInventoryStock = (token: string, payload: InventoryAdjustmentPayload) =>
  requestWithAuth<{ item: InventoryItem; transaction: InventoryTransaction }>(
    '/api/inventory/adjust',
    token,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );

export const getInventoryTransactions = (token: string, params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestWithAuth<Paginated<InventoryTransaction>>(
    `/api/inventory/transactions${suffix}`,
    token
  );
};

export const getInventoryStocks = (token: string, params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestWithAuth<Paginated<InventoryStock>>(`/api/inventory/stocks${suffix}`, token);
};
