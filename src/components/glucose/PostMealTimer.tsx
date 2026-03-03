"use client";

import { useState, useEffect } from "react";
import { Timer, X } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "meal_timer_end";

export function startMealTimer(minutes = 60) {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      STORAGE_KEY,
      String(Date.now() + minutes * 60 * 1000)
    );
  }
}

export function PostMealTimer() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  // Read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const end = Number(stored);
      if (end > Date.now()) {
        setEndsAt(end);
        setRemaining(Math.ceil((end - Date.now()) / 1000));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Countdown tick
  useEffect(() => {
    if (!endsAt) return;
    const interval = setInterval(() => {
      const rem = Math.ceil((endsAt - Date.now()) / 1000);
      if (rem <= 0) {
        setEndsAt(null);
        setRemaining(0);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setRemaining(rem);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (!endsAt) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
      <Timer className="h-5 w-5 flex-shrink-0 text-violet-600" />
      <div className="flex-1">
        <p className="text-xs font-medium text-violet-700">
          Hora de medir a glicemia!
        </p>
        <p className="text-xl font-bold tabular-nums text-violet-800">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>
      </div>
      <Link
        href="/registrar/glicemia"
        className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white"
      >
        Medir
      </Link>
      <button
        onClick={() => {
          localStorage.removeItem(STORAGE_KEY);
          setEndsAt(null);
        }}
        className="p-1 text-violet-400 hover:text-violet-600"
        aria-label="Cancelar timer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
