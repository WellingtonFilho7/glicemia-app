import type { GlucoseMealType, MealPeriod } from "@/types";
import { calculateGestationalWeek } from "@/lib/utils/gestational";
import type { AnalysisContext } from "./data-fetcher";

// ─── Labels ──────────────────────────────────────────────────────────────────

const GLUCOSE_LABELS: Record<GlucoseMealType, string> = {
  fasting: "Jejum",
  post_breakfast: "Pós-café",
  post_lunch: "Pós-almoço",
  post_dinner: "Pós-jantar",
};

const MEAL_LABELS: Record<MealPeriod, string> = {
  breakfast: "Café da manhã",
  lunch: "Almoço",
  dinner: "Jantar",
  snack: "Lanche",
};

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = DAY_NAMES[d.getDay()];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${day} ${dd}/${mm}`;
}

function fmtDateFromIso(iso: string): string {
  return fmtDate(iso.split("T")[0]);
}

// ─── Grouping helpers ─────────────────────────────────────────────────────────

function groupByDate<T>(items: T[], getDate: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const date = getDate(item).split("T")[0];
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(item);
  }
  return map;
}

// ─── Section formatters ───────────────────────────────────────────────────────

function formatCheckins(ctx: AnalysisContext): string {
  if (ctx.checkins.length === 0) return "Nenhum check-in registrado no período.\n";

  let out = "";
  for (const c of ctx.checkins) {
    const parts: string[] = [];
    if (c.stiffness_score != null) parts.push(`Rigidez ${c.stiffness_score}/10`);
    if (c.pain_score != null) parts.push(`Dor ${c.pain_score}/10`);
    if (c.energy_score != null) parts.push(`Energia ${c.energy_score}/10`);
    parts.push(`Náusea: ${c.nausea ? "sim" : "não"}`);

    out += `${fmtDate(c.date)}: ${parts.join(" | ")}`;
    if (c.notes) out += ` | Nota: "${c.notes}"`;
    out += "\n";
  }
  return out;
}

function formatGlucose(ctx: AnalysisContext): string {
  if (ctx.glucoseEntries.length === 0)
    return "Nenhuma medição de glicemia registrada no período.\n";

  const byDate = groupByDate(ctx.glucoseEntries, (e) => e.measured_at);
  let out = "";

  for (const [date, entries] of [...byDate.entries()].sort()) {
    out += `${fmtDate(date)}:\n`;
    for (const e of entries) {
      const time = e.minutes_after_meal ? `${e.minutes_after_meal}min` : "";
      const status = e.is_above_limit ? "[ACIMA DO LIMITE]" : "[ok]";
      const label = GLUCOSE_LABELS[e.meal_type];
      out += `  - ${label}${time ? ` (${time})` : ""}: ${e.value} mg/dL ${status}\n`;
    }
  }
  return out;
}

function formatMeals(ctx: AnalysisContext): string {
  if (ctx.meals.length === 0) return "Nenhuma refeição registrada no período.\n";

  const byDate = groupByDate(ctx.meals, (m) => m.eaten_at);
  let out = "";

  for (const [date, meals] of [...byDate.entries()].sort()) {
    out += `${fmtDate(date)}:\n`;
    for (const m of meals) {
      const label = MEAL_LABELS[m.period] ?? m.period;
      out += `  - ${label}`;

      if (m.items && m.items.length > 0) {
        const itemList = m.items
          .map((i) => {
            const qty = i.quantity_grams ? `${i.quantity_grams}g` : i.quantity_description ?? "";
            return qty ? `${i.name} ${qty}` : i.name;
          })
          .join(", ");
        out += `: ${itemList}`;
      }

      const totals: string[] = [];
      if (m.total_calories) totals.push(`${m.total_calories} kcal`);
      if (m.total_carbs_grams) totals.push(`${m.total_carbs_grams}g carb`);
      if (m.total_protein_grams) totals.push(`${m.total_protein_grams}g prot`);
      if (totals.length > 0) out += `\n    Total: ${totals.join(" | ")}`;

      out += "\n";
    }
  }
  return out;
}

function formatWeight(ctx: AnalysisContext): string {
  if (ctx.weightEntries.length === 0) return "Nenhum registro de peso.\n";

  const entries = ctx.weightEntries;
  let out = `Última medição: ${entries[0].value_kg} kg (${fmtDateFromIso(entries[0].measured_at)})\n`;

  if (entries.length > 1) {
    out += `Medição anterior: ${entries[1].value_kg} kg (${fmtDateFromIso(entries[1].measured_at)})\n`;
    const diff = (Number(entries[0].value_kg) - Number(entries[1].value_kg)).toFixed(1);
    const days = Math.round(
      (new Date(entries[0].measured_at).getTime() -
        new Date(entries[1].measured_at).getTime()) /
        86400000
    );
    out += `Variação: ${Number(diff) >= 0 ? "+" : ""}${diff} kg em ${days} dias\n`;
  }
  return out;
}

function formatSummary(ctx: AnalysisContext): string {
  const glucose = ctx.glucoseEntries;
  const fasting = glucose.filter((e) => e.meal_type === "fasting");
  const postMeal = glucose.filter((e) => e.meal_type !== "fasting");
  const above = glucose.filter((e) => e.is_above_limit);

  const avg = (arr: number[]) =>
    arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(0) : "N/A";

  const checkins = ctx.checkins;
  const avgStiffness = avg(
    checkins.map((c) => c.stiffness_score).filter((v): v is number => v != null)
  );
  const avgEnergy = avg(
    checkins.map((c) => c.energy_score).filter((v): v is number => v != null)
  );

  // Correlação simples: jantar pesado (>500 kcal) → rigidez do dia seguinte
  let correlationNote = "";
  const dinnerByDate = new Map<string, number>();
  for (const m of ctx.meals) {
    if (m.period === "dinner" && m.total_calories) {
      dinnerByDate.set(m.eaten_at.split("T")[0], m.total_calories);
    }
  }

  const heavyDinnerStiffness: number[] = [];
  const lightDinnerStiffness: number[] = [];
  for (const c of checkins) {
    if (c.stiffness_score == null) continue;
    // Pega o jantar do dia anterior
    const prevDate = new Date(c.date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevStr = prevDate.toISOString().split("T")[0];
    const dinnerCals = dinnerByDate.get(prevStr);
    if (dinnerCals != null) {
      if (dinnerCals >= 500) heavyDinnerStiffness.push(c.stiffness_score);
      else lightDinnerStiffness.push(c.stiffness_score);
    }
  }
  if (heavyDinnerStiffness.length >= 2 && lightDinnerStiffness.length >= 1) {
    correlationNote = `\nCorrelação observada: jantar >500kcal → rigidez manhã seguinte média ${avg(heavyDinnerStiffness)}/10 vs jantar <500kcal → ${avg(lightDinnerStiffness)}/10`;
  }

  let profile = ctx.profile;
  const gw = profile
    ? calculateGestationalWeek(
        profile.gestational_week_start,
        profile.gestational_week_number
      )
    : null;

  return [
    `Total de medições de glicemia: ${glucose.length}`,
    `Medições acima do limite: ${above.length}${glucose.length > 0 ? ` (${Math.round((above.length / glucose.length) * 100)}%)` : ""}`,
    fasting.length > 0 ? `Média glicemia jejum: ${avg(fasting.map((e) => e.value))} mg/dL` : null,
    postMeal.length > 0 ? `Média pós-prandial: ${avg(postMeal.map((e) => e.value))} mg/dL` : null,
    checkins.length > 0 ? `Média rigidez matinal: ${avgStiffness}/10` : null,
    checkins.length > 0 ? `Média energia: ${avgEnergy}/10` : null,
    gw ? `Semana gestacional atual: ${gw.week}` : null,
    correlationNote || null,
  ]
    .filter(Boolean)
    .join("\n");
}

// ─── Main builder ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT_TEMPLATE = `Você é uma assistente de saúde gestacional. Seu papel é analisar os dados de saúde da usuária e oferecer observações úteis, padrões e sugestões.

CONTEXTO DA PACIENTE:
- Gestante, atualmente na semana {semana_gestacional}
- Diagnóstico: Diabetes gestacional
- Condição pré-existente: Espondilite anquilosante
- Medicamentos: {medicamentos}
- Limites de glicemia: Jejum < {limite_jejum} mg/dL, Pós-prandial < {limite_posprandial} mg/dL

SOBRE A ESPONDILITE:
A usuária rastreia rigidez matinal, dor e energia diariamente em escalas de 0 a 10. Uma das suas funções mais importantes é correlacionar o que ela comeu (especialmente no jantar) com como ela se sente na manhã seguinte. Sempre que houver dados suficientes, aponte correlações entre alimentação e sintomas.

REGRAS ABSOLUTAS:
1. Você NÃO é médica. Nunca prescreva medicamentos, insulina ou tratamentos.
2. Sempre reforce que decisões médicas devem ser discutidas com o obstetra, endocrinologista ou reumatologista.
3. Baseie-se EXCLUSIVAMENTE nos dados fornecidos abaixo. Se um dado não está presente, diga "não tenho essa informação registrada".
4. NUNCA invente ou extrapole dados que não foram fornecidos.
5. Seja empática, clara e prática. A usuária está grávida e possivelmente cansada — seja direta mas gentil.
6. Quando os números estiverem bons, reconheça o esforço dela.
7. Responda sempre em português brasileiro.
8. Use linguagem acessível, evite jargão médico desnecessário.
9. Quando sugerir mudanças, seja prática: trocas simples, não dietas radicais.

DADOS DA SEMANA:
{dados_formatados}`;

export function buildSystemPrompt(ctx: AnalysisContext): string {
  const profile = ctx.profile;
  const gw = profile
    ? calculateGestationalWeek(
        profile.gestational_week_start,
        profile.gestational_week_number
      )
    : null;

  const dadosFormatados = [
    "=== CHECK-INS MATINAIS (últimos 7 dias) ===",
    formatCheckins(ctx),
    "=== GLICEMIAS (últimos 7 dias) ===",
    formatGlucose(ctx),
    "=== REFEIÇÕES (últimos 7 dias) ===",
    formatMeals(ctx),
    "=== PESO ===",
    formatWeight(ctx),
    "=== RESUMO ===",
    formatSummary(ctx),
  ].join("\n");

  return SYSTEM_PROMPT_TEMPLATE.replace(
    "{semana_gestacional}",
    gw ? String(gw.week) : "não informada"
  )
    .replace("{medicamentos}", profile?.medications || "Nenhum informado")
    .replace("{limite_jejum}", String(profile?.glucose_limit_fasting ?? 95))
    .replace(
      "{limite_posprandial}",
      String(profile?.glucose_limit_postprandial ?? 140)
    )
    .replace("{dados_formatados}", dadosFormatados);
}
