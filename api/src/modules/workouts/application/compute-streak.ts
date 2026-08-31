function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Días consecutivos con al menos una sesión, contando hacia atrás desde "hoy".
 * Si todavía no hay sesión hoy pero sí ayer, la racha sigue activa (no se rompe
 * hasta que pase un día completo sin entrenar) — mismo criterio que apps como
 * Duolingo, evita que el usuario vea "racha en 0" apenas se despierta.
 */
export function computeStreakDays(sessionDates: Date[], now: Date): number {
  const uniqueDays = new Set(sessionDates.map(toDateKey));

  let cursor = now;
  if (!uniqueDays.has(toDateKey(cursor))) {
    cursor = addDays(cursor, -1);
    if (!uniqueDays.has(toDateKey(cursor))) {
      return 0;
    }
  }

  let streak = 0;
  while (uniqueDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
