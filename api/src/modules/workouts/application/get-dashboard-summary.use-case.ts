import { computeStreakDays } from "./compute-streak";
import { toRecentSessionDTO, type DashboardSummaryDTO } from "./dashboard.dto";
import type { WorkoutModulePorts } from "./ports";

const HISTORY_LIMIT = 200;
const RECENT_SESSIONS_LIMIT = 5;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function getDashboardSummary(ports: WorkoutModulePorts) {
  return async (userId: string): Promise<DashboardSummaryDTO> => {
    const sessions = await ports.workoutRepository.listFinishedSessionSummaries(userId, HISTORY_LIMIT);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - WEEK_MS);
    const sessionsThisWeek = sessions.filter((session) => session.startedAt >= weekAgo);

    return {
      totalSessions: sessions.length,
      sessionsThisWeek: sessionsThisWeek.length,
      setsThisWeek: sessionsThisWeek.reduce((sum, session) => sum + session.setCount, 0),
      minutesThisWeek: sessionsThisWeek.reduce((sum, session) => {
        const minutes = (session.finishedAt.getTime() - session.startedAt.getTime()) / 60000;
        return sum + Math.max(0, Math.round(minutes));
      }, 0),
      currentStreakDays: computeStreakDays(
        sessions.map((session) => session.startedAt),
        now,
      ),
      recentSessions: sessions.slice(0, RECENT_SESSIONS_LIMIT).map(toRecentSessionDTO),
    };
  };
}
