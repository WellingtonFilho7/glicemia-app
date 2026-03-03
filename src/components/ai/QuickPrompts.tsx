"use client";

import { Sparkles } from "lucide-react";

const PROMPTS = [
  "Como está minha glicemia esta semana?",
  "Algum padrão entre o que como e como me sinto?",
  "Meu jantar está afetando minha rigidez matinal?",
  "O que posso melhorar nas refeições?",
  "Minha glicemia de jejum está melhorando?",
  "Resumo geral: como estou me saindo?",
];

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickPrompts({ onSelect, disabled }: QuickPromptsProps) {
  return (
    <div className="flex flex-col gap-2">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm transition-colors hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 disabled:pointer-events-none disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4 flex-shrink-0 text-[var(--primary)]" />
          <span className="text-[var(--foreground)]">{prompt}</span>
        </button>
      ))}
    </div>
  );
}
