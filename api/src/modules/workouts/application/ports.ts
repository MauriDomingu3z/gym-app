import type { WorkoutRepository } from "../domain/workout.repository";

export interface WorkoutModulePorts {
  workoutRepository: WorkoutRepository;
}
