"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, ClipboardList } from "lucide-react";
import Link from "next/link";
import { AiChat } from "@/components/ai/AiChat";

function AnaliseContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? undefined;

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)]">
            <Sparkles className="h-5 w-5 text-[var(--primary)]" />
            Análise com IA
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            A IA sempre recebe seus dados frescos — sem alucinações.
          </p>
        </div>
        <Link
          href="/consulta"
          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Consulta
        </Link>
      </div>

      <AiChat initialPrompt={initialPrompt} />
    </div>
  );
}

export default function AnalisePage() {
  return (
    <Suspense fallback={null}>
      <AnaliseContent />
    </Suspense>
  );
}
