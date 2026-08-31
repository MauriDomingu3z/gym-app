import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { Exercise } from '../../models/exercise.model';

@Injectable({ providedIn: 'root' })
export class FavoritesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/favorites`;

  list(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(this.base);
  }

  add(exerciseId: string): Observable<void> {
    return this.http.post<void>(this.base, { exerciseId });
  }

  remove(exerciseId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${exerciseId}`);
  }

  checkStatus(exerciseId: string): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(`${this.base}/${exerciseId}/status`);
  }
}
