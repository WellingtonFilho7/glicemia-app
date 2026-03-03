import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const CreateSavedFoodSchema = z.object({
  name: z.string().min(1).max(200),
  calories_per_100g: z.number().int().min(0).max(10000).nullable().optional(),
  carbs_per_100g: z.number().min(0).max(100).nullable().optional(),
  protein_per_100g: z.number().min(0).max(100).nullable().optional(),
  fat_per_100g: z.number().min(0).max(100).nullable().optional(),
  default_portion_grams: z.number().int().min(1).max(5000).nullable().optional(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("saved_foods")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) throw error;

    return NextResponse.json({ foods: data });
  } catch (error) {
    console.error("Erro ao buscar alimentos salvos:", error);
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
    const parsed = CreateSavedFoodSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("saved_foods")
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ food: data }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar alimento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
