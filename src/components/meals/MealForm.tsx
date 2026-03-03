"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MealItemRow, type FormMealItem } from "./MealItemRow";
import type { MealPeriod } from "@/types";

const PERIODS: { value: MealPeriod; label: string }[] = [
  { value: "breakfast", label: "Café da manhã" },
  { value: "lunch", label: "Almoço" },
  { value: "dinner", label: "Jantar" },
  { value: "snack", label: "Lanche" },
];

function detectPeriod(): MealPeriod {
  const hour = new Date().getHours();
  if (hour < 10) return "breakfast";
  if (hour < 14) return "lunch";
  if (hour < 20) return "dinner";
  return "snack";
}

let itemCounter = 0;
function nextId() {
  return `item-${++itemCounter}`;
}

export function MealForm() {
  const router = useRouter();
  const [period, setPeriod] = useState<MealPeriod>(detectPeriod());
  const [items, setItems] = useState<FormMealItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add-item form state
  const [itemName, setItemName] = useState("");
  const [itemGrams, setItemGrams] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemCalories, setItemCalories] = useState("");
  const [itemCarbs, setItemCarbs] = useState("");

  const totalCalories = items.reduce((s, i) => s + (i.calories ?? 0), 0);
  const totalCarbs = items.reduce((s, i) => s + (i.carbs_grams ?? 0), 0);

  function addItem() {
    if (!itemName.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        localId: nextId(),
        name: itemName.trim(),
        quantity_grams: itemGrams ? Number(itemGrams) : null,
        quantity_description: itemDesc.trim(),
        calories: itemCalories ? Number(itemCalories) : null,
        carbs_grams: itemCarbs ? Number(itemCarbs) : null,
      },
    ]);
    setItemName("");
    setItemGrams("");
    setItemDesc("");
    setItemCalories("");
    setItemCarbs("");
    setShowAddItem(false);
  }

  function removeItem(localId: string) {
    setItems((prev) => prev.filter((i) => i.localId !== localId));
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
        items: items.map(({ localId: _id, ...rest }) => rest),
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

      {/* Period selector */}
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

      {/* Items list */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <p className="text-sm font-semibold text-[var(--foreground)]">
          Alimentos
          {items.length > 0 && (
            <span className="ml-1.5 font-normal text-[var(--muted-foreground)]">
              ({items.length})
            </span>
          )}
        </p>

        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item) => (
              <MealItemRow key={item.localId} item={item} onRemove={removeItem} />
            ))}
          </div>
        )}

        {/* Add item inline form */}
        {showAddItem ? (
          <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-3 space-y-3">
            <input
              type="text"
              placeholder="Nome do alimento *"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                inputMode="decimal"
                placeholder="Gramas (opcional)"
                value={itemGrams}
                onChange={(e) => setItemGrams(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                min={0}
              />
              <input
                type="text"
                placeholder="Ou descreva (ex: 1 fatia)"
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Calorias (kcal)"
                value={itemCalories}
                onChange={(e) => setItemCalories(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                min={0}
              />
              <input
                type="number"
                inputMode="decimal"
                placeholder="Carboidratos (g)"
                value={itemCarbs}
                onChange={(e) => setItemCarbs(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                min={0}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={addItem}
                disabled={!itemName.trim()}
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
                  setItemName("");
                  setItemGrams("");
                  setItemDesc("");
                  setItemCalories("");
                  setItemCarbs("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddItem(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] py-3 text-sm text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)]/50 hover:text-[var(--primary)]"
          >
            <Plus className="h-4 w-4" />
            Adicionar alimento
          </button>
        )}
      </div>

      {/* Totals */}
      {(totalCalories > 0 || totalCarbs > 0) && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Total da refeição
          </p>
          <div className="flex gap-4">
            {totalCalories > 0 && (
              <div>
                <p className="text-xl font-bold text-[var(--foreground)]">{totalCalories}</p>
                <p className="text-xs text-[var(--muted-foreground)]">kcal</p>
              </div>
            )}
            {totalCarbs > 0 && (
              <div>
                <p className="text-xl font-bold text-[var(--foreground)]">{totalCarbs.toFixed(1)}g</p>
                <p className="text-xs text-[var(--muted-foreground)]">carboidratos</p>
              </div>
            )}
          </div>
        </div>
      )}

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
