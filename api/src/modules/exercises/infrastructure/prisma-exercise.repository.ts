import type { Prisma, PrismaClient } from "@prisma/client";
import type { Exercise, ExerciseFilter, ExerciseFilterOptions, ExercisePage } from "../domain/exercise.entity";
import type { ExerciseRepository } from "../domain/exercise.repository";

export class PrismaExerciseRepository implements ExerciseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(filter: ExerciseFilter): Promise<ExercisePage> {
    const conditions: Prisma.ExerciseWhereInput[] = [];

    if (filter.equipment) conditions.push({ equipment: filter.equipment });
    if (filter.type) conditions.push({ exerciseType: filter.type });
    if (filter.muscle) {
      conditions.push({
        OR: [{ primaryMuscle: filter.muscle }, { secondaryMuscles: { has: filter.muscle } }],
      });
    }
    if (filter.search) {
      conditions.push({
        OR: [
          { name: { contains: filter.search, mode: "insensitive" } },
          { nameEs: { contains: filter.search, mode: "insensitive" } },
        ],
      });
    }

    const where: Prisma.ExerciseWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    const [items, total] = await Promise.all([
      this.prisma.exercise.findMany({
        where,
        orderBy: { nameEs: "asc" },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
      }),
      this.prisma.exercise.count({ where }),
    ]);

    return { items, total, page: filter.page, limit: filter.limit };
  }

  async findBySlug(slug: string): Promise<Exercise | null> {
    return this.prisma.exercise.findUnique({ where: { slug } });
  }

  async listFilterOptions(): Promise<ExerciseFilterOptions> {
    const [equipment, muscles, types] = await Promise.all([
      this.prisma.exercise.findMany({ distinct: ["equipment"], select: { equipment: true } }),
      this.prisma.exercise.findMany({ distinct: ["primaryMuscle"], select: { primaryMuscle: true } }),
      this.prisma.exercise.findMany({ distinct: ["exerciseType"], select: { exerciseType: true } }),
    ]);

    return {
      equipment: equipment.map((e) => e.equipment).sort(),
      muscles: muscles.map((m) => m.primaryMuscle).sort(),
      types: types.map((t) => t.exerciseType).sort(),
    };
  }
}
