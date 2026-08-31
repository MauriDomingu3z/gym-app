import type { WorkoutExercise, WorkoutSession, WorkoutSet } from "../domain/workout.entity";

export interface WorkoutSetDTO {
  id: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
  createdAt: Date;
}

export interface WorkoutExerciseDTO {
  id: string;
  exerciseId: string;
  position: number;
  sets: WorkoutSetDTO[];
}

export interface WorkoutSessionDTO {
  id: string;
  startedAt: Date;
  finishedAt: Date | null;
  exercises: WorkoutExerciseDTO[];
}

export function toWorkoutSetDTO(set: WorkoutSet): WorkoutSetDTO {
  return {
    id: set.id,
    setNumber: set.setNumber,
    weightKg: set.weightKg,
    reps: set.reps,
    durationSeconds: set.durationSeconds,
    restSeconds: set.restSeconds,
    createdAt: set.createdAt,
  };
}

export function toWorkoutExerciseDTO(exercise: WorkoutExercise): WorkoutExerciseDTO {
  return {
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    position: exercise.position,
    sets: exercise.sets.map(toWorkoutSetDTO),
  };
}

export function toSessionDTO(session: WorkoutSession): WorkoutSessionDTO {
  return {
    id: session.id,
    startedAt: session.startedAt,
    finishedAt: session.finishedAt,
    exercises: session.exercises.map(toWorkoutExerciseDTO),
  };
}
