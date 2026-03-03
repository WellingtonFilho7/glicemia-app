"use client";

import type { GlucoseMealType } from "@/types";

const TYPES: { value: GlucoseMealType; label: string }[] = [
  { value: "fasting", label: "Jejum" },
  { value: "post_breakfast", label: "Pós-café" },
  { value: "post_lunch", label: "Pós-almoço" },
  { value: "post_dinner", label: "Pós-jantar" },
];

interface GlucoseTypeSelectorProps {
  value: GlucoseMealType;
  onChange: (type: GlucoseMealType) => void;
}

export function GlucoseTypeSelector({ value, onChange }: GlucoseTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {TYPES.map((type) => (
        <button
          key={type.value}
          type="button"
          onClick={() => onChange(type.value)}
          className={`rounded-lg border py-3 text-sm font-medium transition-colors ${
            value === type.value
              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
              : "border-[var(--border)] text-[var(--muted-foreground)]"
          }`}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}
