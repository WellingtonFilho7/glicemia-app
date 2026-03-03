import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateDailyCheckinSchema } from "@/lib/validators/checkin";
import { z } from "zod";

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
    const days = Number(searchParams.get("days") ?? "7");
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", since.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ checkins: data });
  } catch (error) {
    console.error("Erro ao buscar check-ins:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

const RequestBodySchema = CreateDailyCheckinSchema.extend({
  fasting_glucose: z.number().int().min(40).max(500).nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = RequestBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { fasting_glucose, ...checkinData } = parsed.data;

    // Verifica se já existe check-in para hoje
    const { data: existing } = await supabase
      .from("daily_checkins")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", checkinData.date)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Check-in já registrado para hoje" },
        { status: 409 }
      );
    }

    // Salva o check-in
    const { data: checkin, error: checkinError } = await supabase
      .from("daily_checkins")
      .insert({ ...checkinData, user_id: user.id })
      .select()
      .single();

    if (checkinError) throw checkinError;

    // Salva a glicemia de jejum se fornecida
    if (fasting_glucose) {
      await supabase.from("glucose_entries").insert({
        user_id: user.id,
        value: fasting_glucose,
        meal_type: "fasting",
        minutes_after_meal: null,
        measured_at: new Date().toISOString(),
        notes: "Registrado via check-in matinal",
      });
    }

    return NextResponse.json({ checkin }, { status: 201 });
  } catch (error) {
    console.error("Erro ao processar check-in:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
