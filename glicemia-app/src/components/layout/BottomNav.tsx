"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Início",
    href: "/",
    icon: Home,
  },
  {
    label: "Histórico",
    href: "/historico",
    icon: BarChart2,
  },
  {
    label: "IA",
    href: "/analise",
    icon: Sparkles,
  },
  {
    label: "Perfil",
    href: "/perfil",
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--background)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                active
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon
                className={cn("h-5 w-5", active && "stroke-[2.5]")}
                aria-hidden="true"
              />
              <span className="text-xs font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
