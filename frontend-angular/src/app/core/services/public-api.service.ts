import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getApiBaseUrl } from '../api.utils';
import { CompanySettings } from '../types';

@Injectable({ providedIn: 'root' })
export class PublicApiService {
  private base = getApiBaseUrl();
  constructor(private http: HttpClient) {}

  getCompany() {
    return this.http.get<CompanySettings>(`${this.base}/api/public/company`);
  }
}
