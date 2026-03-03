import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function escapeCsv(value: string | number | boolean | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function row(fields: (string | number | boolean | null | undefined)[]): string {
  return fields.map(escapeCsv).join(",");
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get("days") ?? "30");
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceIso = since.toISOString();
    const sinceDate = sinceIso.split("T")[0];

    const [glucoseRes, mealsRes, weightRes, checkinsRes] = await Promise.all([
      supabase
        .from("glucose_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("measured_at", sinceIso)
        .order("measured_at"),
      supabase
        .from("meals")
        .select("*, items:meal_items(name, quantity_grams, quantity_description, calories, carbs_grams)")
        .eq("user_id", user.id)
        .gte("eaten_at", sinceIso)
        .order("eaten_at"),
      supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("measured_at", sinceIso)
        .order("measured_at"),
      supabase
        .from("daily_checkins")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", sinceDate)
        .order("date"),
    ]);

    const glucose = glucoseRes.data ?? [];
    const meals = mealsRes.data ?? [];
    const weight = weightRes.data ?? [];
    const checkins = checkinsRes.data ?? [];

    const lines: string[] = [];

    // Glucose
    lines.push("=== GLICEMIAS ===");
    lines.push(
      row(["Data/Hora", "Tipo", "Valor (mg/dL)", "Min após refeição", "Acima limite", "Notas"])
    );
    for (const e of glucose) {
      lines.push(
        row([
          e.measured_at,
          e.meal_type,
          e.value,
          e.minutes_after_meal,
          e.is_above_limit ? "sim" : "não",
          e.notes,
        ])
      );
    }

    lines.push("");

    // Meals
    lines.push("=== REFEIÇÕES ===");
    lines.push(
      row(["Data/Hora", "Período", "Descrição", "Total kcal", "Total carbs (g)", "Total prot (g)", "Notas", "Itens"])
    );
    for (const m of meals) {
      const items = Array.isArray(m.items)
        ? m.items
            .map((i: { name: string; quantity_grams?: number | null; quantity_description?: string | null; calories?: number | null; carbs_grams?: number | null }) => {
              const qty = i.quantity_grams ? `${i.quantity_grams}g` : i.quantity_description ?? "";
              return qty ? `${i.name} ${qty}` : i.name;
            })
            .join(" | ")
        : "";
      lines.push(
        row([
          m.eaten_at,
          m.period,
          m.description,
          m.total_calories,
          m.total_carbs_grams,
          m.total_protein_grams,
          m.notes,
          items,
        ])
      );
    }

    lines.push("");

    // Weight
    lines.push("=== PESO ===");
    lines.push(row(["Data/Hora", "Peso (kg)"]));
    for (const w of weight) {
      lines.push(row([w.measured_at, w.value_kg]));
    }

    lines.push("");

    // Checkins
    lines.push("=== CHECK-INS MATINAIS ===");
    lines.push(
      row(["Data", "Rigidez (0-10)", "Dor (0-10)", "Energia (0-10)", "Náusea", "Notas"])
    );
    for (const c of checkins) {
      lines.push(
        row([
          c.date,
          c.stiffness_score,
          c.pain_score,
          c.energy_score,
          c.nausea ? "sim" : "não",
          c.notes,
        ])
      );
    }

    const csv = lines.join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="glicemia-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar dados:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
