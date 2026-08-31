import type { WorkoutModulePorts } from "./ports";
import { toSessionDTO, type WorkoutSessionDTO } from "./workout.dto";

export function startSession(ports: WorkoutModulePorts) {
  return async (userId: string): Promise<WorkoutSessionDTO> => {
    const active = await ports.workoutRepository.findActiveSession(userId);
    if (active) {
      return toSessionDTO(active);
    }
    const session = await ports.workoutRepository.createSession(userId);
    return toSessionDTO(session);
  };
}
