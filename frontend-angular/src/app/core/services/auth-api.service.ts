import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getApiBaseUrl } from '../api.utils';
import { AuthUser } from '../types';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private base = getApiBaseUrl();
  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: AuthUser }>(`${this.base}/api/auth/login`, {
      email,
      password
    });
  }

  register(payload: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    address?: string;
    companyName?: string;
    gstNumber?: string;
  }) {
    return this.http.post<AuthUser>(`${this.base}/api/auth/register`, payload);
  }

  updateProfile(payload: Partial<AuthUser>) {
    return this.http.patch<AuthUser>(`${this.base}/api/auth/me`, payload);
  }
}
