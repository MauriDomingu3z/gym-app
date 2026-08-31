import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { Exercise, ExerciseFilterOptions, ExercisePage, ExerciseQuery } from '../../models/exercise.model';

@Injectable({ providedIn: 'root' })
export class ExercisesApiService {
  private readonly http = inject(HttpClient);

  list(query: ExerciseQuery = {}): Observable<ExercisePage> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<ExercisePage>(`${environment.apiBaseUrl}/exercises`, { params });
  }

  getBySlug(slug: string): Observable<Exercise> {
    return this.http.get<Exercise>(`${environment.apiBaseUrl}/exercises/${slug}`);
  }

  filters(): Observable<ExerciseFilterOptions> {
    return this.http.get<ExerciseFilterOptions>(`${environment.apiBaseUrl}/exercises/filters`);
  }
}
