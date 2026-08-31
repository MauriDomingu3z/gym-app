import type { FinishedSessionSummary } from "../domain/workout.entity";

export interface RecentSessionDTO {
  id: string;
  startedAt: Date;
  finishedAt: Date;
  exerciseCount: number;
  setCount: number;
  durationMinutes: number;
}

export interface DashboardSummaryDTO {
  totalSessions: number;
  sessionsThisWeek: number;
  setsThisWeek: number;
  minutesThisWeek: number;
  currentStreakDays: number;
  recentSessions: RecentSessionDTO[];
}

export function toRecentSessionDTO(session: FinishedSessionSummary): RecentSessionDTO {
  const durationMs = session.finishedAt.getTime() - session.startedAt.getTime();
  return {
    id: session.id,
    startedAt: session.startedAt,
    finishedAt: session.finishedAt,
    exerciseCount: session.exerciseCount,
    setCount: session.setCount,
    durationMinutes: Math.max(0, Math.round(durationMs / 60000)),
  };
}
