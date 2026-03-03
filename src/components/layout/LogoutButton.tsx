"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="group flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-left transition-colors hover:border-red-200 hover:bg-red-50"
    >
      <LogOut className="h-5 w-5 text-[var(--muted-foreground)] group-hover:text-red-600" />
      <span className="text-sm font-medium text-[var(--foreground)] group-hover:text-red-600">
        Sair da conta
      </span>
    </button>
  );
}
