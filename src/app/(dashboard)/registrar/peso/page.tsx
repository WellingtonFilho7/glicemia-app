"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, CheckCircle2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PesoPage() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numValue = Number(value.replace(",", "."));
  const hasValue = value !== "" && !isNaN(numValue) && numValue >= 30;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasValue) {
      setError("Informe o valor do peso.");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/weight-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        value_kg: numValue,
        measured_at: new Date().toISOString(),
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
        Registrar peso
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
          <Scale className="h-10 w-10 text-[var(--muted-foreground)]/50" />
          <div className="flex items-end gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="00.0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-36 rounded-2xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-5 text-center text-4xl font-bold text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              min={30}
              max={300}
              aria-label="Peso em kg"
              autoFocus
            />
            <span className="mb-5 text-lg font-medium text-[var(--muted-foreground)]">
              kg
            </span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Use vírgula ou ponto para decimais
          </p>
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
