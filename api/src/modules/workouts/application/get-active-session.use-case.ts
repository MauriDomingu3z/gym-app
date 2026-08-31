import type { WorkoutModulePorts } from "./ports";
import { toSessionDTO, type WorkoutSessionDTO } from "./workout.dto";

export function getActiveSession(ports: WorkoutModulePorts) {
  return async (userId: string): Promise<WorkoutSessionDTO | null> => {
    const session = await ports.workoutRepository.findActiveSession(userId);
    return session ? toSessionDTO(session) : null;
  };
}
