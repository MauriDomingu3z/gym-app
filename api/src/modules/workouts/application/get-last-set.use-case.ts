import type { WorkoutModulePorts } from "./ports";
import { toWorkoutSetDTO, type WorkoutSetDTO } from "./workout.dto";

export function getLastSet(ports: WorkoutModulePorts) {
  return async (userId: string, exerciseId: string): Promise<WorkoutSetDTO | null> => {
    const set = await ports.workoutRepository.getLastSet(userId, exerciseId);
    return set ? toWorkoutSetDTO(set) : null;
  };
}
