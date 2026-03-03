import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { calculateGestationalWeek } from "@/lib/utils/gestational";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let gestationalWeek: number | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("gestational_week_start, gestational_week_number")
      .eq("id", user.id)
      .single();

    if (profile?.gestational_week_start && profile?.gestational_week_number) {
      const result = calculateGestationalWeek(
        profile.gestational_week_start,
        profile.gestational_week_number
      );
      gestationalWeek = result?.week ?? null;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Header gestationalWeek={gestationalWeek} />
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
