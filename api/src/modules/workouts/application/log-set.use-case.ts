import { ForbiddenError, NotFoundError, ValidationError } from "../../../shared/errors/AppError";
import type { LogSetInput } from "../domain/workout.entity";
import type { WorkoutModulePorts } from "./ports";
import { toWorkoutSetDTO, type WorkoutSetDTO } from "./workout.dto";

const TIMED_TYPES = new Set(["duration", "distance_duration"]);
const WEIGHT_REPS_TYPES = new Set(["weight_reps", "bodyweight_reps", "assisted_bodyweight"]);

function validateInputForExerciseType(exerciseType: string, input: LogSetInput): void {
  if (TIMED_TYPES.has(exerciseType)) {
    if (input.durationSeconds === undefined) {
      throw new ValidationError("Este ejercicio es de duración: falta `durationSeconds`");
    }
    if (input.weightKg !== undefined || input.reps !== undefined) {
      throw new ValidationError("Este ejercicio es de duración: no corresponde mandar `weightKg`/`reps`");
    }
    return;
  }

  if (WEIGHT_REPS_TYPES.has(exerciseType)) {
    if (input.reps === undefined) {
      throw new ValidationError("Este ejercicio es de peso/repeticiones: falta `reps`");
    }
    if (input.durationSeconds !== undefined) {
      throw new ValidationError("Este ejercicio es de peso/repeticiones: no corresponde mandar `durationSeconds`");
    }
  }
}

export function logSet(ports: WorkoutModulePorts) {
  return async (userId: string, workoutExerciseId: string, input: LogSetInput): Promise<WorkoutSetDTO> => {
    const workoutExercise = await ports.workoutRepository.findWorkoutExerciseOwner(workoutExerciseId);
    if (!workoutExercise) {
      throw new NotFoundError("No existe ese ejercicio dentro de la sesión");
    }
    if (workoutExercise.ownerId !== userId) {
      throw new ForbiddenError("Este registro no te pertenece");
    }

    validateInputForExerciseType(workoutExercise.exerciseType, input);

    const set = await ports.workoutRepository.logSet(workoutExerciseId, input);
    return toWorkoutSetDTO(set);
  };
}
