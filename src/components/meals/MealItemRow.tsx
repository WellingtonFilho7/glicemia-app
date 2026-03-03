"use client";

import { X } from "lucide-react";

export interface FormMealItem {
  localId: string;
  name: string;
  quantity_grams: number | null;
  quantity_description: string;
  calories: number | null;
  carbs_grams: number | null;
}

interface MealItemRowProps {
  item: FormMealItem;
  onRemove: (localId: string) => void;
}

export function MealItemRow({ item, onRemove }: MealItemRowProps) {
  const qty = item.quantity_grams
    ? `${item.quantity_grams}g`
    : item.quantity_description || null;

  const macros = [
    item.calories != null ? `${item.calories} kcal` : null,
    item.carbs_grams != null ? `${item.carbs_grams}g carb` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-start justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--foreground)]">
          {item.name}
          {qty ? (
            <span className="ml-1 text-[var(--muted-foreground)]">{qty}</span>
          ) : null}
        </p>
        {macros && (
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{macros}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.localId)}
        className="ml-1 mt-0.5 flex-shrink-0 rounded p-0.5 text-[var(--muted-foreground)] transition-colors hover:bg-red-100 hover:text-red-600"
        aria-label={`Remover ${item.name}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
