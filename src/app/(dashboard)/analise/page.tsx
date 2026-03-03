import { Sparkles } from "lucide-react";
import { AiChat } from "@/components/ai/AiChat";

export const metadata = { title: "Análise IA — Glicemia App" };

export default function AnalisePage() {
  return (
    <div className="px-4 py-6 space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)]">
          <Sparkles className="h-5 w-5 text-[var(--primary)]" />
          Análise com IA
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          A IA sempre recebe seus dados frescos — sem alucinações.
        </p>
      </div>

      <AiChat />
    </div>
  );
}
