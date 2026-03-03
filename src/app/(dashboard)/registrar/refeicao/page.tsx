"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MealForm } from "@/components/meals/MealForm";

export default function RefeicaoPage() {
  const router = useRouter();

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
        Registrar refeição
      </h1>

      <MealForm />
    </div>
  );
}
