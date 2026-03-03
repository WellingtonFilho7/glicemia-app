"use client";

import { useState, useEffect } from "react";
import { BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SavedFood } from "@/types";

interface Props {
  onSelect: (food: SavedFood) => void;
}

export function SavedFoodPicker({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [foods, setFoods] = useState<SavedFood[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/saved-foods")
      .then((r) => r.json())
      .then((data) => setFoods(data.foods ?? []))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = foods.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(food: SavedFood) {
    onSelect(food);
    setOpen(false);
    setSearch("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="flex-1">
          <BookOpen className="mr-1.5 h-4 w-4" />
          Meus alimentos
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[80vh] flex-col gap-3">
        <DialogHeader>
          <DialogTitle>Meus alimentos salvos</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Buscar alimento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
          {loading && (
            <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">
              Carregando...
            </p>
          )}
          {!loading && filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">
              {foods.length === 0
                ? "Nenhum alimento salvo. Adicione em Perfil → Meus alimentos."
                : "Nenhum resultado para a busca."}
            </p>
          )}
          {filtered.map((food) => (
            <button
              key={food.id}
              type="button"
              onClick={() => handleSelect(food)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-left transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
            >
              <p className="text-sm font-medium text-[var(--foreground)]">
                {food.name}
              </p>
              {(food.default_portion_grams != null ||
                food.calories_per_100g != null) && (
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  {food.default_portion_grams
                    ? `Porção: ${food.default_portion_grams}g`
                    : ""}
                  {food.default_portion_grams && food.calories_per_100g
                    ? " · "
                    : ""}
                  {food.calories_per_100g != null
                    ? `${food.calories_per_100g} kcal/100g`
                    : ""}
                </p>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
