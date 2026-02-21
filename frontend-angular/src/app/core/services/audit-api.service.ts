import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getApiBaseUrl, toQuery } from '../api.utils';
import { AuditLog, Paginated } from '../types';

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private base = getApiBaseUrl();
  constructor(private http: HttpClient) {}

  getLogs(params?: { page?: number; limit?: number }) {
    return this.http.get<Paginated<AuditLog>>(
      `${this.base}/api/audit-logs${toQuery({ page: params?.page, limit: params?.limit })}`
    );
  }
}
