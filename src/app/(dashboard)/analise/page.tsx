import { Sparkles, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Análise IA — Glicemia App" };

const quickPrompts = [
  "Como está minha glicemia esta semana?",
  "Existe correlação entre o que comi e a rigidez de amanhã?",
  "Resumo do dia de hoje",
  "Sugestões para o jantar de hoje",
];

export default function AnalisePage() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-[var(--primary)]" />
          Análise com IA
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Pergunte qualquer coisa sobre seus dados
        </p>
      </div>

      {/* Chat placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-5 w-5 text-[var(--primary)]" />
            Chat com Claude
          </CardTitle>
          <CardDescription>
            A IA sempre recebe seus dados frescos do banco — sem alucinações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Sparkles className="h-10 w-10 text-[var(--muted-foreground)]/40" />
            <p className="text-sm text-[var(--muted-foreground)] italic">
              Em construção — AiChat component
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Perguntas rápidas */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">
          Perguntas rápidas
        </h2>
        <div className="flex flex-col gap-2">
          {quickPrompts.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              className="justify-start text-left h-auto py-3 px-4 font-normal"
              disabled
            >
              <Sparkles className="h-4 w-4 text-[var(--primary)] shrink-0 mr-2" />
              <span className="text-sm">{prompt}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
