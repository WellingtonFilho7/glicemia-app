"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ArrowLeft, AlertCircle, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SavedFood } from "@/types";

const EMPTY_FORM = {
  name: "",
  calories_per_100g: "",
  carbs_per_100g: "",
  protein_per_100g: "",
  default_portion_grams: "",
};

export default function AlimentosPage() {
  const [foods, setFoods] = useState<SavedFood[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadFoods = useCallback(async () => {
    const res = await fetch("/api/saved-foods");
    if (res.ok) {
      const data = await res.json();
      setFoods(data.foods ?? []);
    }
  }, []);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/saved-foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          calories_per_100g: form.calories_per_100g
            ? Number(form.calories_per_100g)
            : null,
          carbs_per_100g: form.carbs_per_100g
            ? Number(form.carbs_per_100g)
            : null,
          protein_per_100g: form.protein_per_100g
            ? Number(form.protein_per_100g)
            : null,
          default_portion_grams: form.default_portion_grams
            ? Number(form.default_portion_grams)
            : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Erro ao salvar.");
        return;
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadFoods();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/saved-foods/${id}`, { method: "DELETE" });
    setFoods((prev) => prev.filter((f) => f.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/perfil"
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Meus alimentos
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Alimentos frequentes com dados nutricionais
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4 space-y-3"
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Novo alimento
          </p>
          <input
            type="text"
            placeholder="Nome *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            autoFocus
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Porção padrão (g)"
              value={form.default_portion_grams}
              onChange={(e) =>
                setForm((p) => ({ ...p, default_portion_grams: e.target.value }))
              }
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              min={1}
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Kcal / 100g"
              value={form.calories_per_100g}
              onChange={(e) =>
                setForm((p) => ({ ...p, calories_per_100g: e.target.value }))
              }
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              min={0}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="Carbs / 100g"
              value={form.carbs_per_100g}
              onChange={(e) =>
                setForm((p) => ({ ...p, carbs_per_100g: e.target.value }))
              }
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              min={0}
            />
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="Proteína / 100g"
              value={form.protein_per_100g}
              onChange={(e) =>
                setForm((p) => ({ ...p, protein_per_100g: e.target.value }))
              }
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              min={0}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!form.name.trim() || saving}
              size="sm"
              className="flex-1"
            >
              {saving ? (
                "Salvando..."
              ) : (
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  Salvar
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setForm(EMPTY_FORM);
                setError(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {foods.length === 0 && !showForm && (
          <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
            Nenhum alimento salvo ainda.
          </p>
        )}
        {foods.map((food) => (
          <div
            key={food.id}
            className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"
          >
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {food.name}
              </p>
              {(food.default_portion_grams != null ||
                food.calories_per_100g != null) && (
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  {food.default_portion_grams
                    ? `${food.default_portion_grams}g`
                    : ""}
                  {food.default_portion_grams && food.calories_per_100g
                    ? " · "
                    : ""}
                  {food.calories_per_100g != null
                    ? `${food.calories_per_100g} kcal/100g`
                    : ""}
                  {food.carbs_per_100g != null
                    ? ` · ${food.carbs_per_100g}g carb/100g`
                    : ""}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(food.id)}
              disabled={deletingId === food.id}
              className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              aria-label={`Excluir ${food.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {!showForm && (
        <Button
          type="button"
          onClick={() => setShowForm(true)}
          className="h-12 w-full text-base"
        >
          <Plus className="mr-2 h-5 w-5" />
          Adicionar alimento
        </Button>
      )}
    </div>
  );
}
