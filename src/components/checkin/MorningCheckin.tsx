"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sun, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SymptomSlider } from "./SymptomSlider";

export function MorningCheckin() {
  const router = useRouter();
  const [fastingGlucose, setFastingGlucose] = useState("");
  const [stiffness, setStiffness] = useState(5);
  const [pain, setPain] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [nausea, setNausea] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const today = new Date().toISOString().split("T")[0];

    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: today,
        stiffness_score: stiffness,
        pain_score: pain,
        energy_score: energy,
        nausea,
        notes: notes.trim() || null,
        fasting_glucose: fastingGlucose ? Number(fastingGlucose) : null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao salvar check-in. Tente novamente.");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
          <Sun className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Bom dia!</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Como você está hoje?</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Glicemia de jejum */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
          <label
            htmlFor="fasting-glucose"
            className="text-sm font-semibold text-[var(--foreground)]"
          >
            Glicemia em jejum
          </label>
          <div className="flex items-center gap-3">
            <input
              id="fasting-glucose"
              type="number"
              inputMode="numeric"
              placeholder="ex: 88"
              value={fastingGlucose}
              onChange={(e) => setFastingGlucose(e.target.value)}
              className="w-28 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-center text-2xl font-bold text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              min={40}
              max={500}
            />
            <span className="text-sm text-[var(--muted-foreground)]">mg/dL</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Normal: abaixo de 95 mg/dL
          </p>
        </div>

        {/* Sliders de sintomas */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-5">
          <SymptomSlider
            label="Rigidez matinal"
            description="Quanto seu corpo está rígido ao acordar?"
            value={stiffness}
            onChange={setStiffness}
            lowLabel="Nenhuma"
            highLabel="Muita"
          />
          <div className="border-t border-[var(--border)]" />
          <SymptomSlider
            label="Dor"
            description="Nível de dor geral agora"
            value={pain}
            onChange={setPain}
            lowLabel="Sem dor"
            highLabel="Muita dor"
          />
          <div className="border-t border-[var(--border)]" />
          <SymptomSlider
            label="Energia"
            description="Como está sua energia?"
            value={energy}
            onChange={setEnergy}
            lowLabel="Sem energia"
            highLabel="Muita energia"
          />
        </div>

        {/* Náusea */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">
            Está com náusea?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setNausea(false)}
              className={`flex-1 rounded-lg border py-3 text-sm font-medium transition-colors ${
                !nausea
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)]"
              }`}
            >
              Não
            </button>
            <button
              type="button"
              onClick={() => setNausea(true)}
              className={`flex-1 rounded-lg border py-3 text-sm font-medium transition-colors ${
                nausea
                  ? "border-red-400 bg-red-50 text-red-700"
                  : "border-[var(--border)] text-[var(--muted-foreground)]"
              }`}
            >
              Sim
            </button>
          </div>
        </div>

        {/* Observação livre */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
          <label
            htmlFor="notes"
            className="text-sm font-semibold text-[var(--foreground)]"
          >
            Algo mais?{" "}
            <span className="font-normal text-[var(--muted-foreground)]">
              (opcional)
            </span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Como você dormiu? Algum sintoma diferente?"
            rows={3}
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            maxLength={1000}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full text-base font-semibold"
        >
          {loading ? (
            "Salvando..."
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Registrar check-in
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
