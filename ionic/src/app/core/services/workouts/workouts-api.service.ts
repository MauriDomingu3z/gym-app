import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  DashboardSummary,
  ExerciseHistoryEntry,
  LogSetInput,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
} from '../../models/workout.model';

@Injectable({ providedIn: 'root' })
export class WorkoutsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/workouts`;

  getActiveSession(): Observable<WorkoutSession | null> {
    return this.http.get<WorkoutSession | null>(`${this.base}/sessions/active`);
  }

  startSession(): Observable<WorkoutSession> {
    return this.http.post<WorkoutSession>(`${this.base}/sessions`, {});
  }

  finishSession(sessionId: string): Observable<WorkoutSession> {
    return this.http.post<WorkoutSession>(`${this.base}/sessions/${sessionId}/finish`, {});
  }

  addExerciseToSession(sessionId: string, exerciseId: string): Observable<WorkoutExercise> {
    return this.http.post<WorkoutExercise>(`${this.base}/sessions/${sessionId}/exercises`, { exerciseId });
  }

  logSet(workoutExerciseId: string, input: LogSetInput): Observable<WorkoutSet> {
    return this.http.post<WorkoutSet>(`${this.base}/workout-exercises/${workoutExerciseId}/sets`, input);
  }

  getLastSet(exerciseId: string): Observable<WorkoutSet | null> {
    return this.http.get<WorkoutSet | null>(`${this.base}/exercises/${exerciseId}/last-set`);
  }

  getHistory(exerciseId: string, limit = 50): Observable<ExerciseHistoryEntry[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<ExerciseHistoryEntry[]>(`${this.base}/exercises/${exerciseId}/history`, { params });
  }

  getDashboard(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.base}/dashboard`);
  }
}
