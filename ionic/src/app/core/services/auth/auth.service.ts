import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { AuthResult, User, WeightUnit } from '../../models/user.model';

const ACCESS_TOKEN_KEY = 'gym_app_access_token';
const REFRESH_TOKEN_KEY = 'gym_app_refresh_token';
const USER_KEY = 'gym_app_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly userSignal = signal<User | null>(null);
  private readonly readySignal = signal(false);

  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.accessTokenSignal() !== null);
  readonly ready = this.readySignal.asReadonly();

  private readonly restored: Promise<void>;

  constructor() {
    this.restored = this.restoreSession();
  }

  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  whenReady(): Promise<void> {
    return this.restored;
  }

  async register(email: string, password: string, name?: string): Promise<void> {
    const result = await firstValueFrom(
      this.http.post<AuthResult>(`${environment.apiBaseUrl}/auth/register`, { email, password, name }),
    );
    await this.persistSession(result);
  }

  async login(email: string, password: string): Promise<void> {
    const result = await firstValueFrom(
      this.http.post<AuthResult>(`${environment.apiBaseUrl}/auth/login`, { email, password }),
    );
    await this.persistSession(result);
  }

  async refresh(): Promise<string | null> {
    const { value: refreshToken } = await Preferences.get({ key: REFRESH_TOKEN_KEY });
    if (!refreshToken) {
      return null;
    }

    try {
      const result = await firstValueFrom(
        this.http.post<AuthResult>(`${environment.apiBaseUrl}/auth/refresh`, { refreshToken }),
      );
      await this.persistSession(result);
      return result.accessToken;
    } catch {
      await this.clearSession();
      return null;
    }
  }

  async logout(): Promise<void> {
    await this.clearSession();
  }

  async updatePreferredUnit(preferredUnit: WeightUnit): Promise<void> {
    const user = await firstValueFrom(
      this.http.patch<User>(`${environment.apiBaseUrl}/users/me`, { preferredUnit }),
    );
    this.userSignal.set(user);
    await Preferences.set({ key: USER_KEY, value: JSON.stringify(user) });
  }

  private async persistSession(result: AuthResult): Promise<void> {
    this.accessTokenSignal.set(result.accessToken);
    this.userSignal.set(result.user);
    await Promise.all([
      Preferences.set({ key: ACCESS_TOKEN_KEY, value: result.accessToken }),
      Preferences.set({ key: REFRESH_TOKEN_KEY, value: result.refreshToken }),
      Preferences.set({ key: USER_KEY, value: JSON.stringify(result.user) }),
    ]);
  }

  private async clearSession(): Promise<void> {
    this.accessTokenSignal.set(null);
    this.userSignal.set(null);
    await Promise.all([
      Preferences.remove({ key: ACCESS_TOKEN_KEY }),
      Preferences.remove({ key: REFRESH_TOKEN_KEY }),
      Preferences.remove({ key: USER_KEY }),
    ]);
  }

  private async restoreSession(): Promise<void> {
    const [{ value: accessToken }, { value: userRaw }] = await Promise.all([
      Preferences.get({ key: ACCESS_TOKEN_KEY }),
      Preferences.get({ key: USER_KEY }),
    ]);

    if (accessToken && userRaw) {
      this.accessTokenSignal.set(accessToken);
      this.userSignal.set(JSON.parse(userRaw) as User);
    }

    this.readySignal.set(true);
  }
}
