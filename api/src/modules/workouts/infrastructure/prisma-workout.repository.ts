import type { PrismaClient } from "@prisma/client";
import type {
  ExerciseHistoryEntry,
  FinishedSessionSummary,
  LogSetInput,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
} from "../domain/workout.entity";
import type { WorkoutRepository } from "../domain/workout.repository";

const sessionInclude = {
  exercises: {
    orderBy: { position: "asc" as const },
    include: { sets: { orderBy: { setNumber: "asc" as const } } },
  },
};

export class PrismaWorkoutRepository implements WorkoutRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findActiveSession(userId: string): Promise<WorkoutSession | null> {
    return this.prisma.workoutSession.findFirst({
      where: { userId, finishedAt: null },
      orderBy: { startedAt: "desc" },
      include: sessionInclude,
    });
  }

  createSession(userId: string): Promise<WorkoutSession> {
    return this.prisma.workoutSession.create({
      data: { userId },
      include: sessionInclude,
    });
  }

  finishSession(sessionId: string): Promise<WorkoutSession> {
    return this.prisma.workoutSession.update({
      where: { id: sessionId },
      data: { finishedAt: new Date() },
      include: sessionInclude,
    });
  }

  async findSessionOwner(sessionId: string): Promise<string | null> {
    const record = await this.prisma.workoutSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });
    return record?.userId ?? null;
  }

  async addExerciseToSession(sessionId: string, exerciseId: string): Promise<WorkoutExercise> {
    const position = await this.prisma.workoutExercise.count({ where: { sessionId } });
    return this.prisma.workoutExercise.create({
      data: { sessionId, exerciseId, position: position + 1 },
      include: { sets: { orderBy: { setNumber: "asc" } } },
    });
  }

  async findWorkoutExerciseOwner(workoutExerciseId: string): Promise<string | null> {
    const record = await this.prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
      select: { session: { select: { userId: true } } },
    });
    return record?.session.userId ?? null;
  }

  async logSet(workoutExerciseId: string, input: LogSetInput): Promise<WorkoutSet> {
    const setNumber = (await this.prisma.workoutSet.count({ where: { workoutExerciseId } })) + 1;
    return this.prisma.workoutSet.create({
      data: {
        workoutExerciseId,
        setNumber,
        weightKg: input.weightKg ?? null,
        reps: input.reps ?? null,
        durationSeconds: input.durationSeconds ?? null,
        restSeconds: input.restSeconds ?? null,
      },
    });
  }

  getLastSet(userId: string, exerciseId: string): Promise<WorkoutSet | null> {
    return this.prisma.workoutSet.findFirst({
      where: { workoutExercise: { exerciseId, session: { userId } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async getExerciseHistory(userId: string, exerciseId: string, limit: number): Promise<ExerciseHistoryEntry[]> {
    const sets = await this.prisma.workoutSet.findMany({
      where: { workoutExercise: { exerciseId, session: { userId } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { workoutExercise: { include: { session: true } } },
    });

    return sets.map((set) => ({
      setId: set.id,
      sessionId: set.workoutExercise.sessionId,
      sessionStartedAt: set.workoutExercise.session.startedAt,
      setNumber: set.setNumber,
      weightKg: set.weightKg,
      reps: set.reps,
      durationSeconds: set.durationSeconds,
    }));
  }

  async listFinishedSessionSummaries(userId: string, limit: number): Promise<FinishedSessionSummary[]> {
    const sessions = await this.prisma.workoutSession.findMany({
      where: { userId, finishedAt: { not: null } },
      orderBy: { startedAt: "desc" },
      take: limit,
      include: {
        exercises: {
          select: { _count: { select: { sets: true } } },
        },
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      startedAt: session.startedAt,
      finishedAt: session.finishedAt as Date,
      exerciseCount: session.exercises.length,
      setCount: session.exercises.reduce((sum, exercise) => sum + exercise._count.sets, 0),
    }));
  }
}
