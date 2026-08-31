export interface WorkoutSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
  createdAt: Date;
}

export interface WorkoutExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  position: number;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  startedAt: Date;
  finishedAt: Date | null;
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
  sessionStartedAt: Date;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  durationSeconds: number | null;
}

export interface FinishedSessionSummary {
  id: string;
  startedAt: Date;
  finishedAt: Date;
  exerciseCount: number;
  setCount: number;
}
