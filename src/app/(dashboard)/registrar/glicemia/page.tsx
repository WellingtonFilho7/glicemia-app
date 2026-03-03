"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlucoseInput } from "@/components/glucose/GlucoseInput";
import { GlucoseTypeSelector } from "@/components/glucose/GlucoseTypeSelector";
import type { GlucoseMealType } from "@/types";

function detectMealType(): GlucoseMealType {
  const hour = new Date().getHours();
  if (hour < 10) return "fasting";
  if (hour < 14) return "post_breakfast";
  if (hour < 20) return "post_lunch";
  return "post_dinner";
}

export default function GlucemiaPage() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [mealType, setMealType] = useState<GlucoseMealType>(detectMealType);
  const [minutesAfterMeal, setMinutesAfterMeal] = useState("60");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numValue = Number(value);
  const hasValue = value !== "" && !isNaN(numValue) && numValue >= 40;
  const isFasting = mealType === "fasting";
  const isAboveLimit = hasValue && (isFasting ? numValue >= 95 : numValue >= 140);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasValue) {
      setError("Informe o valor da glicemia.");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/glucose-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        value: numValue,
        meal_type: mealType,
        minutes_after_meal:
          !isFasting && minutesAfterMeal ? Number(minutesAfterMeal) : null,
        measured_at: new Date().toISOString(),
        notes: notes.trim() || null,
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
    <div className="px-4 py-6">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <h1 className="mb-6 text-xl font-bold text-[var(--foreground)]">
        Registrar glicemia
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Input numérico grande */}
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <GlucoseInput
            value={value}
            onChange={setValue}
            isAboveLimit={isAboveLimit}
          />
          {hasValue && (
            <p
              className={`text-sm font-medium ${
                isAboveLimit ? "text-red-600" : "text-green-600"
              }`}
            >
              {isAboveLimit
                ? `Acima do limite (${isFasting ? "95" : "140"} mg/dL)`
                : "Dentro do esperado"}
            </p>
          )}
        </div>

        {/* Tipo de medição */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Medição
          </p>
          <GlucoseTypeSelector value={mealType} onChange={setMealType} />
        </div>

        {/* Tempo após refeição — oculto para jejum */}
        {!isFasting && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
            <label
              htmlFor="minutes"
              className="text-sm font-semibold text-[var(--foreground)]"
            >
              Tempo após a refeição
            </label>
            <div className="flex items-center gap-2">
              <input
                id="minutes"
                type="number"
                inputMode="numeric"
                value={minutesAfterMeal}
                onChange={(e) => setMinutesAfterMeal(e.target.value)}
                className="w-20 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-center text-lg font-bold text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                min={0}
                max={480}
              />
              <span className="text-sm text-[var(--muted-foreground)]">
                minutos
              </span>
            </div>
          </div>
        )}

        {/* Nota opcional */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
          <label
            htmlFor="notes"
            className="text-sm font-semibold text-[var(--foreground)]"
          >
            Nota{" "}
            <span className="font-normal text-[var(--muted-foreground)]">
              (opcional)
            </span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: após caminhar 20 minutos"
            rows={2}
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            maxLength={500}
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !hasValue}
          className="h-12 w-full text-base font-semibold"
        >
          {loading ? (
            "Salvando..."
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Salvar
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
