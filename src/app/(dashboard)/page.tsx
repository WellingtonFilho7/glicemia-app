import { redirect } from "next/navigation";
import { Droplets, UtensilsCrossed } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MorningCheckin } from "@/components/checkin/MorningCheckin";
import { CheckinSummary } from "@/components/checkin/CheckinSummary";
import type { DailyCheckin } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  const { data: checkin } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  if (!checkin) {
    return <MorningCheckin />;
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">
          Bom dia!
        </h1>
        <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      <CheckinSummary checkin={checkin as DailyCheckin} />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Registrar agora
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard
            icon={<Droplets className="h-6 w-6 text-violet-600" />}
            title="Glicemia"
            description="Pós-refeição"
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
      className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5"
    >
      <div className="flex flex-col gap-2">
        {icon}
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {title}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
        </div>
      </div>
    </a>
  );
}
