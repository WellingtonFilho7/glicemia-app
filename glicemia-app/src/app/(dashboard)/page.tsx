import { Activity, Droplets, UtensilsCrossed, ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Bom dia! 👋</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Vamos começar o registro de hoje?
        </p>
      </div>

      {/* Check-in matinal — P0 */}
      <Card className="border-2 border-[var(--primary)]/30 bg-[var(--primary)]/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-5 w-5 text-[var(--primary)]" />
            Check-in matinal
          </CardTitle>
          <CardDescription>
            Rigidez, dor, energia e náusea de hoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)] italic">
            Em construção — implementar MorningCheckin component
          </p>
        </CardContent>
      </Card>

      {/* Ações rápidas */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">
          Registrar agora
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard
            icon={<Droplets className="h-6 w-6 text-violet-600" />}
            title="Glicemia"
            description="Jejum ou pós-refeição"
            href="/registrar/glicemia"
          />
          <QuickActionCard
            icon={<UtensilsCrossed className="h-6 w-6 text-emerald-600" />}
            title="Refeição"
            description="Café, almoço ou jantar"
            href="/registrar/refeicao"
          />
        </div>
      </div>

      {/* Resumo do dia */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">
          Resumo de hoje
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <Activity className="h-10 w-10 text-[var(--muted-foreground)]/40" />
              <p className="text-sm text-[var(--muted-foreground)]">
                Nenhum registro ainda hoje.
              </p>
              <p className="text-xs text-[var(--muted-foreground)]/60">
                Comece com o check-in matinal.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 transition-colors"
    >
      <div className="flex flex-col gap-2">
        {icon}
        <div>
          <p className="font-semibold text-sm text-[var(--foreground)]">{title}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
        </div>
      </div>
    </a>
  );
}
