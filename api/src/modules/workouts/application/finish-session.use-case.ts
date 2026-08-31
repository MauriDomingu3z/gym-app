import { ForbiddenError, NotFoundError } from "../../../shared/errors/AppError";
import type { WorkoutModulePorts } from "./ports";
import { toSessionDTO, type WorkoutSessionDTO } from "./workout.dto";

export function finishSession(ports: WorkoutModulePorts) {
  return async (userId: string, sessionId: string): Promise<WorkoutSessionDTO> => {
    const ownerId = await ports.workoutRepository.findSessionOwner(sessionId);
    if (!ownerId) {
      throw new NotFoundError("No existe esa sesión de entrenamiento");
    }
    if (ownerId !== userId) {
      throw new ForbiddenError("Esta sesión no te pertenece");
    }

    const session = await ports.workoutRepository.finishSession(sessionId);
    return toSessionDTO(session);
  };
}
