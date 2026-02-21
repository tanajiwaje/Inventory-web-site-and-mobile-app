import { Injectable, signal } from '@angular/core';
import { AuthUser } from './types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token = signal<string | null>(null);
  private _user = signal<AuthUser | null>(null);
  private _ready = signal(false);

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly ready = this._ready.asReadonly();

  constructor() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this._token.set(token);
      this._user.set(JSON.parse(user) as AuthUser);
    }
    this._ready.set(true);
  }

  login(token: string, user: AuthUser) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._token.set(null);
    this._user.set(null);
  }

  updateUser(user: AuthUser) {
    localStorage.setItem('user', JSON.stringify(user));
    this._user.set(user);
  }
}
