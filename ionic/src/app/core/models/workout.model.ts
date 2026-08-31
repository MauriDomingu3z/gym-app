export interface WorkoutSet {
  id: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
  createdAt: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  position: number;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  exercises: WorkoutExercise[];
}

export interface LogSetInput {
  weightKg?: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds?: number;
}

export interface ExerciseHistoryEntry {
  setId: string;
  sessionId: string;
  sessionStartedAt: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  durationSeconds: number | null;
}

export interface RecentSession {
  id: string;
  startedAt: string;
  finishedAt: string;
  exerciseCount: number;
  setCount: number;
  durationMinutes: number;
}

export interface DashboardSummary {
  totalSessions: number;
  sessionsThisWeek: number;
  setsThisWeek: number;
  minutesThisWeek: number;
  currentStreakDays: number;
  recentSessions: RecentSession[];
}
