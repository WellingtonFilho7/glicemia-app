"use client";

import type { DailyCheckin } from "@/types";

interface CheckinSummaryProps {
  checkin: DailyCheckin;
}

function ScorePill({
  label,
  value,
  invert = false,
}: {
  label: string;
  value: number | null;
  invert?: boolean;
}) {
  if (value === null) return null;

  const isGood = invert ? value >= 7 : value <= 3;
  const isMid = value >= 4 && value <= 6;

  const color = isGood
    ? "bg-green-100 text-green-700"
    : isMid
    ? "bg-amber-100 text-amber-700"
    : "bg-red-100 text-red-700";

  return (
    <div className={`flex flex-col items-center rounded-lg px-3 py-2 ${color}`}>
      <span className="text-lg font-bold tabular-nums">{value}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

export function CheckinSummary({ checkin }: CheckinSummaryProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        Como você está hoje
      </p>
      <div className="flex gap-2">
        <ScorePill label="Rigidez" value={checkin.stiffness_score} />
        <ScorePill label="Dor" value={checkin.pain_score} />
        <ScorePill label="Energia" value={checkin.energy_score} invert />
        {checkin.nausea && (
          <div className="flex flex-col items-center rounded-lg bg-amber-100 px-3 py-2 text-amber-700">
            <span className="text-lg">🤢</span>
            <span className="text-xs">Náusea</span>
          </div>
        )}
      </div>
      {checkin.notes && (
        <p className="mt-3 text-sm text-[var(--muted-foreground)] italic">
          &ldquo;{checkin.notes}&rdquo;
        </p>
      )}
    </div>
  );
}
