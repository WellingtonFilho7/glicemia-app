import { GestationalWeek } from "@/types";

/**
 * Calcula a semana gestacional atual com base nos dados do perfil.
 *
 * Lógica: semana_atual = gestational_week_number + floor(dias_desde(gestational_week_start) / 7)
 *
 * @returns GestationalWeek ou null se os dados do perfil não estiverem configurados
 */
export function calculateGestationalWeek(
  gestationalWeekStart: string | null,
  gestationalWeekNumber: number | null,
  referenceDate: Date = new Date()
): GestationalWeek | null {
  if (!gestationalWeekStart || gestationalWeekNumber == null) return null;

  const startDate = new Date(gestationalWeekStart);
  if (isNaN(startDate.getTime())) return null;

  const daysSinceStart = Math.floor(
    (referenceDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceStart < 0) return null;

  const totalWeeks = gestationalWeekNumber + Math.floor(daysSinceStart / 7);
  const extraDays = daysSinceStart % 7;

  if (totalWeeks > 42 || totalWeeks < 1) return null;

  const trimester: 1 | 2 | 3 =
    totalWeeks <= 13 ? 1 : totalWeeks <= 26 ? 2 : 3;

  return {
    week: totalWeeks,
    days: extraDays,
    trimester,
  };
}

/**
 * Formata a semana gestacional para exibição.
 * Ex: "Sem. 28" ou "Sem. 28+3" se quiser incluir dias
 */
export function formatGestationalWeek(gw: GestationalWeek | null): string {
  if (!gw) return "—";
  return `Sem. ${gw.week}`;
}
