import { ForbiddenError, NotFoundError } from "../../../shared/errors/AppError";
import type { LogSetInput } from "../domain/workout.entity";
import type { WorkoutModulePorts } from "./ports";
import { toWorkoutSetDTO, type WorkoutSetDTO } from "./workout.dto";

export function logSet(ports: WorkoutModulePorts) {
  return async (userId: string, workoutExerciseId: string, input: LogSetInput): Promise<WorkoutSetDTO> => {
    const ownerId = await ports.workoutRepository.findWorkoutExerciseOwner(workoutExerciseId);
    if (!ownerId) {
      throw new NotFoundError("No existe ese ejercicio dentro de la sesión");
    }
    if (ownerId !== userId) {
      throw new ForbiddenError("Este registro no te pertenece");
    }

    const set = await ports.workoutRepository.logSet(workoutExerciseId, input);
    return toWorkoutSetDTO(set);
  };
}
