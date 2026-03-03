"use client";

import { useState, useEffect } from "react";
import { Save, AlertCircle, CheckCircle2, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/layout/LogoutButton";
import type { Profile } from "@/types";

interface FormState {
  name: string;
  gestational_week_number: string;
  gestational_week_start: string;
  glucose_limit_fasting: string;
  glucose_limit_postprandial: string;
  medications: string;
}

export default function PerfilPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    gestational_week_number: "",
    gestational_week_start: "",
    glucose_limit_fasting: "95",
    glucose_limit_postprandial: "140",
    medications: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          const p: Profile = data.profile;
          setForm({
            name: p.name ?? "",
            gestational_week_number:
              p.gestational_week_number != null
                ? String(p.gestational_week_number)
                : "",
            gestational_week_start: p.gestational_week_start ?? "",
            glucose_limit_fasting: String(p.glucose_limit_fasting ?? 95),
            glucose_limit_postprandial: String(
              p.glucose_limit_postprandial ?? 140
            ),
            medications: p.medications ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const body: Record<string, unknown> = {};
    if (form.name.trim()) body.name = form.name.trim();
    if (form.gestational_week_number)
      body.gestational_week_number = Number(form.gestational_week_number);
    if (form.gestational_week_start)
      body.gestational_week_start = form.gestational_week_start;
    if (form.glucose_limit_fasting)
      body.glucose_limit_fasting = Number(form.glucose_limit_fasting);
    if (form.glucose_limit_postprandial)
      body.glucose_limit_postprandial = Number(form.glucose_limit_postprandial);
    body.medications = form.medications.trim() || null;

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Erro ao salvar.");
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-[var(--muted-foreground)]">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Perfil</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Configurações e dados pessoais
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          Perfil atualizado com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identificação */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Identificação
          </p>
          <div className="space-y-1.5">
            <label className="text-xs text-[var(--muted-foreground)]">
              Nome
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Seu nome"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>

        {/* Semana gestacional */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Semana gestacional
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Informe em qual semana você estava em uma data de referência. O app
            calcula a semana atual automaticamente.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-[var(--muted-foreground)]">
                Semana na data
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={form.gestational_week_number}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    gestational_week_number: e.target.value,
                  }))
                }
                placeholder="Ex: 24"
                min={1}
                max={42}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[var(--muted-foreground)]">
                Data de referência
              </label>
              <input
                type="date"
                value={form.gestational_week_start}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    gestational_week_start: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
          </div>
        </div>

        {/* Limites de glicemia */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Limites de glicemia
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Conforme orientação do seu médico
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-[var(--muted-foreground)]">
                Jejum (mg/dL)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={form.glucose_limit_fasting}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    glucose_limit_fasting: e.target.value,
                  }))
                }
                min={60}
                max={200}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[var(--muted-foreground)]">
                Pós-refeição (mg/dL)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={form.glucose_limit_postprandial}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    glucose_limit_postprandial: e.target.value,
                  }))
                }
                min={80}
                max={300}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
          </div>
        </div>

        {/* Medicamentos */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Medicamentos
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Informe os medicamentos que usa para que a IA considere nas análises
          </p>
          <textarea
            value={form.medications}
            onChange={(e) =>
              setForm((p) => ({ ...p, medications: e.target.value }))
            }
            placeholder="Ex: Metformina 500mg 2x/dia, Vitamina D 2000 UI"
            rows={3}
            maxLength={1000}
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="h-12 w-full text-base font-semibold"
        >
          {saving ? (
            "Salvando..."
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Salvar perfil
            </span>
          )}
        </Button>
      </form>

      {/* Link para meus alimentos */}
      <Link
        href="/perfil/alimentos"
        className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--primary)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10">
            <UtensilsCrossed className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Meus alimentos
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Gerencie alimentos frequentes com dados nutricionais
            </p>
          </div>
        </div>
        <span className="text-lg text-[var(--muted-foreground)]">›</span>
      </Link>

      <LogoutButton />
    </div>
  );
}
