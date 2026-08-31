import { ForbiddenError, NotFoundError } from "../../../shared/errors/AppError";
import type { WorkoutModulePorts } from "./ports";
import { toWorkoutExerciseDTO, type WorkoutExerciseDTO } from "./workout.dto";

export interface AddExerciseToSessionInput {
  userId: string;
  sessionId: string;
  exerciseId: string;
}

export function addExerciseToSession(ports: WorkoutModulePorts) {
  return async (input: AddExerciseToSessionInput): Promise<WorkoutExerciseDTO> => {
    const ownerId = await ports.workoutRepository.findSessionOwner(input.sessionId);
    if (!ownerId) {
      throw new NotFoundError("No existe esa sesión de entrenamiento");
    }
    if (ownerId !== input.userId) {
      throw new ForbiddenError("Esta sesión no te pertenece");
    }

    const workoutExercise = await ports.workoutRepository.addExerciseToSession(
      input.sessionId,
      input.exerciseId,
    );
    return toWorkoutExerciseDTO(workoutExercise);
  };
}
