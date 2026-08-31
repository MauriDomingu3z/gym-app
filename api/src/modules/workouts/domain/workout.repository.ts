import type {
  ExerciseHistoryEntry,
  FinishedSessionSummary,
  LogSetInput,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
} from "./workout.entity";

export interface WorkoutRepository {
  findActiveSession(userId: string): Promise<WorkoutSession | null>;
  createSession(userId: string): Promise<WorkoutSession>;
  finishSession(sessionId: string): Promise<WorkoutSession>;
  findSessionOwner(sessionId: string): Promise<string | null>;
  addExerciseToSession(sessionId: string, exerciseId: string): Promise<WorkoutExercise>;
  findWorkoutExerciseOwner(
    workoutExerciseId: string,
  ): Promise<{ ownerId: string; exerciseType: string } | null>;
  logSet(workoutExerciseId: string, input: LogSetInput): Promise<WorkoutSet>;
  getLastSet(userId: string, exerciseId: string): Promise<WorkoutSet | null>;
  getExerciseHistory(userId: string, exerciseId: string, limit: number): Promise<ExerciseHistoryEntry[]>;
  listFinishedSessionSummaries(userId: string, limit: number): Promise<FinishedSessionSummary[]>;
}
