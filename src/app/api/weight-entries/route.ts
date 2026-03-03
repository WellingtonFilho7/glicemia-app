import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateWeightEntrySchema } from "@/lib/validators/weight";

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

    const { data, error } = await supabase
      .from("weight_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("measured_at", since.toISOString())
      .order("measured_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ entries: data });
  } catch (error) {
    console.error("Erro ao buscar peso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

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
    const parsed = CreateWeightEntrySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("weight_entries")
      .insert({
        ...parsed.data,
        user_id: user.id,
        measured_at: parsed.data.measured_at ?? new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar peso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
