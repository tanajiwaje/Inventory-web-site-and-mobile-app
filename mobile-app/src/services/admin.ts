import { requestWithAuth } from './api';
import { AdminDashboard, CompanySettings, PendingUser } from '../types';

export const getAdminDashboard = (token: string) =>
  requestWithAuth<AdminDashboard>('/api/reports/dashboard', token);

export const getPendingUsers = (token: string) =>
  requestWithAuth<PendingUser[]>('/api/users/pending', token);

export const approveUser = (token: string, id: string) =>
  requestWithAuth(`/api/users/${id}/approve`, token, { method: 'POST' });

export const rejectUser = (token: string, id: string) =>
  requestWithAuth(`/api/users/${id}/reject`, token, { method: 'POST' });

export const getCompanySettings = (token: string) =>
  requestWithAuth<CompanySettings>('/api/company', token);

export const updateCompanySettings = (token: string, payload: Partial<CompanySettings>) =>
  requestWithAuth<CompanySettings>('/api/company', token, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
