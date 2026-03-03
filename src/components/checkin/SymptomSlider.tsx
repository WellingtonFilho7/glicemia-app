"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SymptomSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  lowLabel?: string;
  highLabel?: string;
  className?: string;
}

export function SymptomSlider({
  label,
  value,
  onChange,
  description,
  lowLabel = "Nenhum",
  highLabel = "Máximo",
  className,
}: SymptomSliderProps) {
  const getColor = () => {
    if (value <= 3) return "text-green-600";
    if (value <= 6) return "text-amber-600";
    return "text-red-600";
  };

  const getRangeColor = () => {
    if (value <= 3) return "bg-green-500";
    if (value <= 6) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
          {description && (
            <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
          )}
        </div>
        <span className={cn("text-2xl font-bold tabular-nums w-8 text-right", getColor())}>
          {value}
        </span>
      </div>
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center py-1"
        min={0}
        max={10}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      >
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-[var(--border)]">
          <SliderPrimitive.Range
            className={cn("absolute h-full transition-all", getRangeColor())}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-6 w-6 rounded-full border-2 border-[var(--primary)] bg-white shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          aria-label={label}
        />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
        <span>0 — {lowLabel}</span>
        <span>{highLabel} — 10</span>
      </div>
    </div>
  );
}
