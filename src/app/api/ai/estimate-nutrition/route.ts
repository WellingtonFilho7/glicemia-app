import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const RequestSchema = z.object({
  name: z.string().min(1).max(200),
  quantity_grams: z.number().positive().optional(),
  quantity_description: z.string().max(100).optional(),
});

interface NutritionEstimate {
  calories: number | null;
  carbs_grams: number | null;
  protein_grams: number | null;
  fat_grams: number | null;
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
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { name, quantity_grams, quantity_description } = parsed.data;

    const qtdStr = quantity_grams
      ? `${quantity_grams}g`
      : quantity_description ?? "porção padrão";

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system:
        'Você é um calculador nutricional. Responda APENAS com JSON válido, sem texto adicional, sem markdown. Use valores médios da composição nutricional brasileira. Formato: {"calories": 120, "carbs_grams": 22.0, "protein_grams": 3.0, "fat_grams": 1.5}',
      messages: [
        {
          role: "user",
          content: `Estime as calorias e macronutrientes para: ${name}, ${qtdStr}.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    let estimate: NutritionEstimate = {
      calories: null,
      carbs_grams: null,
      protein_grams: null,
      fat_grams: null,
    };

    try {
      const parsed = JSON.parse(text.trim());
      estimate = {
        calories: typeof parsed.calories === "number" ? Math.round(parsed.calories) : null,
        carbs_grams: typeof parsed.carbs_grams === "number" ? Number(parsed.carbs_grams.toFixed(1)) : null,
        protein_grams: typeof parsed.protein_grams === "number" ? Number(parsed.protein_grams.toFixed(1)) : null,
        fat_grams: typeof parsed.fat_grams === "number" ? Number(parsed.fat_grams.toFixed(1)) : null,
      };
    } catch {
      // Return nulls if JSON parse fails
    }

    return NextResponse.json(estimate);
  } catch (error) {
    console.error("Erro na estimativa nutricional:", error);
    return NextResponse.json(
      { error: "Erro ao estimar nutrição" },
      { status: 500 }
    );
  }
}
