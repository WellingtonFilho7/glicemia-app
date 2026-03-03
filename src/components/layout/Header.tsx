import { Activity } from "lucide-react";

interface HeaderProps {
  gestationalWeek?: number | null;
}

/**
 * Header fixo do dashboard.
 * Mostra o logo, semana gestacional e data atual.
 * Os dados do perfil são passados via props (Server Component amigável).
 */
export function Header({ gestationalWeek }: HeaderProps) {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Capitaliza o primeiro caractere
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          <span className="font-semibold text-[var(--foreground)]">
            Glicemia App
          </span>
        </div>

        <div className="flex flex-col items-end">
          {gestationalWeek ? (
            <span className="text-sm font-semibold text-[var(--primary)]">
              Sem. {gestationalWeek}
            </span>
          ) : null}
          <span className="text-xs text-[var(--muted-foreground)] leading-none mt-0.5">
            {todayFormatted}
          </span>
        </div>
      </div>
    </header>
  );
}
