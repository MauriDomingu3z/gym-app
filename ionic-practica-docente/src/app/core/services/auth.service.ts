import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResult, LoginPayload, RegisterPayload } from '../models/auth.model';

const TOKEN_KEY = 'accessToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  Register(payload: RegisterPayload): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap((result) => localStorage.setItem(TOKEN_KEY, result.accessToken)));
  }

  Login(payload: LoginPayload): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap((result) => localStorage.setItem(TOKEN_KEY, result.accessToken)));
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token || this.isExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  private isExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
