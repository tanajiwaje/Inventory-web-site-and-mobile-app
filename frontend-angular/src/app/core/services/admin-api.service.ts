import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getApiBaseUrl } from '../api.utils';
import { AdminDashboard, CompanySettings } from '../types';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private base = getApiBaseUrl();
  constructor(private http: HttpClient) {}

  getPendingUsers() {
    return this.http.get<Array<{
      _id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      phone?: string;
      address?: string;
      companyName?: string;
      gstNumber?: string;
    }>>(`${this.base}/api/users/pending`);
  }

  approveUser(id: string) {
    return this.http.post(`${this.base}/api/users/${id}/approve`, {});
  }

  rejectUser(id: string) {
    return this.http.post(`${this.base}/api/users/${id}/reject`, {});
  }

  getDashboard() {
    return this.http.get<AdminDashboard>(`${this.base}/api/reports/dashboard`);
  }

  getCompanySettings() {
    return this.http.get<CompanySettings>(`${this.base}/api/company`);
  }

  updateCompanySettings(payload: Partial<CompanySettings>) {
    return this.http.put<CompanySettings>(`${this.base}/api/company`, payload);
  }
}
