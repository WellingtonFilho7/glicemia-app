import { User, Settings, Baby, Pill, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Perfil — Glicemia App" };

export default function PerfilPage() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Perfil</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Configurações e dados pessoais
        </p>
      </div>

      {/* Resumo do perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5 text-[var(--primary)]" />
            Dados gestacionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted-foreground)]">Semana gestacional</span>
            <Badge variant="secondary">Configure seu perfil</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted-foreground)]">Espondilite anquilosante</span>
            <Badge variant="outline">Sim</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Limites de glicemia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-5 w-5 text-[var(--primary)]" />
            Limites de glicemia
          </CardTitle>
          <CardDescription>
            Configure os limites recomendados pelo seu médico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted-foreground)]">Jejum</span>
            <Badge variant="outline">95 mg/dL</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted-foreground)]">Pós-refeição</span>
            <Badge variant="outline">140 mg/dL</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Medicamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Pill className="h-5 w-5 text-[var(--primary)]" />
            Medicamentos
          </CardTitle>
          <CardDescription>
            Registre seus medicamentos para contexto da IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)] italic">
            Em construção — UpdateProfileForm
          </p>
        </CardContent>
      </Card>

      {/* Maternidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Baby className="h-5 w-5 text-[var(--primary)]" />
            Dados da gravidez
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)] italic">
            Em construção — data provável do parto, semana inicial
          </p>
        </CardContent>
      </Card>

      {/* Sair */}
      <button className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-left hover:bg-red-50 hover:border-red-200 transition-colors group">
        <LogOut className="h-5 w-5 text-[var(--muted-foreground)] group-hover:text-red-600" />
        <span className="text-sm font-medium text-[var(--foreground)] group-hover:text-red-600">
          Sair da conta
        </span>
      </button>
    </div>
  );
}
