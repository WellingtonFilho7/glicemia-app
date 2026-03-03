import { User, Settings, Baby, Pill } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/layout/LogoutButton";

export const metadata = { title: "Perfil — Glicemia App" };

export default function PerfilPage() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Perfil</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Configurações e dados pessoais
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5 text-[var(--primary)]" />
            Dados gestacionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted-foreground)]">
              Semana gestacional
            </span>
            <Badge variant="secondary">Configure seu perfil</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted-foreground)]">
              Espondilite anquilosante
            </span>
            <Badge variant="outline">Sim</Badge>
          </div>
        </CardContent>
      </Card>

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
            <span className="text-sm text-[var(--muted-foreground)]">
              Pós-refeição
            </span>
            <Badge variant="outline">140 mg/dL</Badge>
          </div>
        </CardContent>
      </Card>

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
          <p className="text-sm italic text-[var(--muted-foreground)]">
            Em construção — Sessão futura
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Baby className="h-5 w-5 text-[var(--primary)]" />
            Dados da gravidez
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm italic text-[var(--muted-foreground)]">
            Em construção — data provável do parto, semana inicial
          </p>
        </CardContent>
      </Card>

      <LogoutButton />
    </div>
  );
}
