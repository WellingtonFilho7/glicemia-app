"use client";

interface GlucoseInputProps {
  value: string;
  onChange: (value: string) => void;
  isAboveLimit?: boolean;
}

export function GlucoseInput({ value, onChange, isAboveLimit }: GlucoseInputProps) {
  const numValue = Number(value);
  const hasValue = value !== "" && !isNaN(numValue) && numValue >= 40;

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="---"
        className={`w-44 rounded-2xl border-2 bg-[var(--background)] px-4 py-6 text-center text-5xl font-bold transition-colors focus:outline-none ${
          hasValue && isAboveLimit
            ? "border-red-400 text-red-600 focus:ring-2 focus:ring-red-300"
            : hasValue
            ? "border-green-400 text-green-700 focus:ring-2 focus:ring-green-300"
            : "border-[var(--border)] text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--ring)]"
        }`}
        min={40}
        max={600}
        aria-label="Valor de glicemia em mg/dL"
      />
      <span className="text-sm font-medium text-[var(--muted-foreground)]">mg/dL</span>
    </div>
  );
}
