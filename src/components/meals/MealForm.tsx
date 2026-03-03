"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Plus, AlertCircle, CheckCircle2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MealItemRow, type FormMealItem } from "./MealItemRow";
import { SavedFoodPicker } from "./SavedFoodPicker";
import type { MealPeriod, SavedFood } from "@/types";

const PERIODS: { value: MealPeriod; label: string }[] = [
  { value: "breakfast", label: "Café da manhã" },
  { value: "lunch", label: "Almoço" },
  { value: "dinner", label: "Jantar" },
  { value: "snack", label: "Lanche" },
];

function detectPeriod(): MealPeriod {
  const h = new Date().getHours();
  if (h < 10) return "breakfast";
  if (h < 14) return "lunch";
  if (h < 19) return "dinner";
  return "snack";
}

interface AddItemForm {
  name: string;
  quantity_grams: string;
  quantity_description: string;
  calories: string;
  carbs_grams: string;
}

const EMPTY_ITEM: AddItemForm = {
  name: "",
  quantity_grams: "",
  quantity_description: "",
  calories: "",
  carbs_grams: "",
};

export function MealForm() {
  const router = useRouter();
  const uid = useId();
  const [period, setPeriod] = useState<MealPeriod>(detectPeriod);
  const [items, setItems] = useState<FormMealItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [addItem, setAddItem] = useState<AddItemForm>(EMPTY_ITEM);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCalories = items.reduce((s, i) => s + (i.calories ?? 0), 0);
  const totalCarbs = items.reduce((s, i) => s + (i.carbs_grams ?? 0), 0);

  function handleAddItem() {
    const name = addItem.name.trim();
    if (!name) return;

    const newItem: FormMealItem = {
      localId: `${uid}-${Date.now()}`,
      name,
      quantity_grams: addItem.quantity_grams ? Number(addItem.quantity_grams) : null,
      quantity_description: addItem.quantity_description.trim(),
      calories: addItem.calories ? Number(addItem.calories) : null,
      carbs_grams: addItem.carbs_grams ? Number(addItem.carbs_grams) : null,
    };

    setItems((prev) => [...prev, newItem]);
    setAddItem(EMPTY_ITEM);
    setShowAddItem(false);
  }

  function handleRemoveItem(localId: string) {
    setItems((prev) => prev.filter((i) => i.localId !== localId));
  }

  function handleSavedFoodSelect(food: SavedFood) {
    const grams = food.default_portion_grams;
    const cals =
      grams != null && food.calories_per_100g != null
        ? Math.round((food.calories_per_100g * grams) / 100)
        : null;
    const carbs =
      grams != null && food.carbs_per_100g != null
        ? Number(((food.carbs_per_100g * grams) / 100).toFixed(1))
        : null;

    setAddItem({
      name: food.name,
      quantity_grams: grams != null ? String(grams) : "",
      quantity_description: "",
      calories: cals != null ? String(cals) : "",
      carbs_grams: carbs != null ? String(carbs) : "",
    });
    setShowAddItem(true);
  }

  async function handleEstimateNutrition() {
    if (!addItem.name.trim()) return;
    setEstimating(true);
    try {
      const res = await fetch("/api/ai/estimate-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addItem.name.trim(),
          quantity_grams: addItem.quantity_grams
            ? Number(addItem.quantity_grams)
            : undefined,
          quantity_description: addItem.quantity_description.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAddItem((prev) => ({
          ...prev,
          calories:
            data.calories != null ? String(data.calories) : prev.calories,
          carbs_grams:
            data.carbs_grams != null
              ? String(data.carbs_grams)
              : prev.carbs_grams,
        }));
      }
    } finally {
      setEstimating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      setError("Adicione pelo menos um alimento.");
      return;
    }
    setLoading(true);
    setError(null);

    const description = items.map((i) => i.name).join(", ");

    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        period,
        description,
        eaten_at: new Date().toISOString(),
        notes: notes.trim() || null,
        items: items.map((i) => ({
          name: i.name,
          quantity_grams: i.quantity_grams,
          quantity_description: i.quantity_description || null,
          calories: i.calories,
          carbs_grams: i.carbs_grams,
        })),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao salvar. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Período */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <p className="text-sm font-semibold text-[var(--foreground)]">Período</p>
        <div className="grid grid-cols-2 gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                period === p.value
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de itens */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <p className="text-sm font-semibold text-[var(--foreground)]">Alimentos</p>

        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item) => (
              <MealItemRow key={item.localId} item={item} onRemove={handleRemoveItem} />
            ))}
          </div>
        )}

        {/* Formulário inline de adicionar item */}
        {showAddItem ? (
          <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-3 space-y-2">
            <input
              type="text"
              placeholder="Nome do alimento *"
              value={addItem.name}
              onChange={(e) => setAddItem((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Gramas (ex: 57)"
                value={addItem.quantity_grams}
                onChange={(e) =>
                  setAddItem((p) => ({ ...p, quantity_grams: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                min={0}
              />
              <input
                type="text"
                placeholder="Ou descreva (ex: 2 ovos)"
                value={addItem.quantity_description}
                onChange={(e) =>
                  setAddItem((p) => ({
                    ...p,
                    quantity_description: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            {/* Botão de estimativa IA */}
            {addItem.name.trim() && (
              <button
                type="button"
                onClick={handleEstimateNutrition}
                disabled={estimating}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 py-1.5 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-60"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {estimating ? "Estimando..." : "Estimar com IA"}
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Calorias (kcal)"
                value={addItem.calories}
                onChange={(e) =>
                  setAddItem((p) => ({ ...p, calories: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                min={0}
              />
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="Carbs (g)"
                value={addItem.carbs_grams}
                onChange={(e) =>
                  setAddItem((p) => ({ ...p, carbs_grams: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                min={0}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleAddItem}
                disabled={!addItem.name.trim()}
                size="sm"
                className="flex-1"
              >
                Adicionar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddItem(false);
                  setAddItem(EMPTY_ITEM);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAddItem(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] py-3 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
            <SavedFoodPicker onSelect={handleSavedFoodSelect} />
          </div>
        )}

        {/* Totais */}
        {items.length > 0 && (totalCalories > 0 || totalCarbs > 0) && (
          <div className="flex items-center justify-between rounded-lg bg-[var(--muted)]/20 px-3 py-2 text-sm">
            <span className="font-semibold text-[var(--foreground)]">Total</span>
            <span className="text-[var(--muted-foreground)]">
              {totalCalories > 0 && `${totalCalories} kcal`}
              {totalCalories > 0 && totalCarbs > 0 && " · "}
              {totalCarbs > 0 && `${totalCarbs}g carb`}
            </span>
          </div>
        )}
      </div>

      {/* Observação */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
        <label className="text-sm font-semibold text-[var(--foreground)]">
          Observação{" "}
          <span className="font-normal text-[var(--muted-foreground)]">(opcional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: comi mais devagar, senti-me pesada depois"
          rows={2}
          className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          maxLength={500}
        />
      </div>

      <Button
        type="submit"
        disabled={loading || items.length === 0}
        className="h-12 w-full text-base font-semibold"
      >
        {loading ? (
          "Salvando..."
        ) : (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Salvar refeição
          </span>
        )}
      </Button>
    </form>
  );
}
