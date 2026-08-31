import type { ExerciseHistoryEntry } from "../domain/workout.entity";
import type { WorkoutModulePorts } from "./ports";

export function getExerciseHistory(ports: WorkoutModulePorts) {
  return async (userId: string, exerciseId: string, limit = 50): Promise<ExerciseHistoryEntry[]> => {
    return ports.workoutRepository.getExerciseHistory(userId, exerciseId, limit);
  };
}
