import { requestWithAuth } from './api';
import { AuditLog, Customer, Location, Paginated, ReturnEntry, Supplier } from '../types';

export const getSuppliers = (token: string, params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestWithAuth<Paginated<Supplier>>(`/api/suppliers${suffix}`, token);
};

export const getCustomers = (token: string, params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestWithAuth<Paginated<Customer>>(`/api/customers${suffix}`, token);
};

export const createSupplier = (token: string, payload: Partial<Supplier>) =>
  requestWithAuth<Supplier>('/api/suppliers', token, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const deleteSupplier = (token: string, id: string) =>
  requestWithAuth<void>(`/api/suppliers/${id}`, token, { method: 'DELETE' });

export const createCustomer = (token: string, payload: Partial<Customer>) =>
  requestWithAuth<Customer>('/api/customers', token, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const deleteCustomer = (token: string, id: string) =>
  requestWithAuth<void>(`/api/customers/${id}`, token, { method: 'DELETE' });

export const getLocations = (token: string, params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestWithAuth<Paginated<Location>>(`/api/locations${suffix}`, token);
};

export const createLocation = (token: string, payload: Partial<Location>) =>
  requestWithAuth<Location>('/api/locations', token, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const deleteLocation = (token: string, id: string) =>
  requestWithAuth<void>(`/api/locations/${id}`, token, { method: 'DELETE' });

export const getReturns = (token: string, params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestWithAuth<Paginated<ReturnEntry>>(`/api/returns${suffix}`, token);
};

export const createReturn = (token: string, payload: Record<string, unknown>) =>
  requestWithAuth<ReturnEntry>('/api/returns', token, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const updateReturn = (token: string, id: string, payload: Record<string, unknown>) =>
  requestWithAuth<ReturnEntry>(`/api/returns/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

export const deleteReturn = (token: string, id: string) =>
  requestWithAuth<void>(`/api/returns/${id}`, token, { method: 'DELETE' });

export const getAuditLogs = (token: string, params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestWithAuth<Paginated<AuditLog>>(`/api/audit-logs${suffix}`, token);
};
