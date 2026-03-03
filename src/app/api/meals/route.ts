import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateMealSchema } from "@/lib/validators/meals";

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
    const parsed = CreateMealSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, ...mealData } = parsed.data;

    // Calculate totals from items
    const totalCalories = items?.reduce((s, i) => s + (i.calories ?? 0), 0) ?? null;
    const totalCarbs = items?.reduce((s, i) => s + (i.carbs_grams ?? 0), 0) ?? null;
    const totalProtein = items?.reduce((s, i) => s + (i.protein_grams ?? 0), 0) ?? null;
    const totalFat = items?.reduce((s, i) => s + (i.fat_grams ?? 0), 0) ?? null;

    // Insert meal
    const { data: meal, error: mealError } = await supabase
      .from("meals")
      .insert({
        ...mealData,
        user_id: user.id,
        eaten_at: mealData.eaten_at ?? new Date().toISOString(),
        total_calories: totalCalories || null,
        total_carbs_grams: totalCarbs || null,
        total_protein_grams: totalProtein || null,
        total_fat_grams: totalFat || null,
      })
      .select()
      .single();

    if (mealError) throw mealError;

    // Insert meal items if provided
    if (items && items.length > 0) {
      const { error: itemsError } = await supabase.from("meal_items").insert(
        items.map((item) => ({
          meal_id: meal.id,
          saved_food_id: item.saved_food_id ?? null,
          name: item.name,
          quantity_grams: item.quantity_grams ?? null,
          quantity_description: item.quantity_description ?? null,
          calories: item.calories ?? null,
          carbs_grams: item.carbs_grams ?? null,
          protein_grams: item.protein_grams ?? null,
          fat_grams: item.fat_grams ?? null,
        }))
      );
      if (itemsError) throw itemsError;
    }

    return NextResponse.json({ meal }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar refeição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
