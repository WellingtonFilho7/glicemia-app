import { Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Entrar — Glicemia App" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Glicemia App
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Seu diário de saúde gestacional
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entrar na sua conta</CardTitle>
            <CardDescription>
              Acesse seus registros de qualquer dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[var(--foreground)]"
                >
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[var(--foreground)]"
                >
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <Button className="w-full" type="submit" disabled>
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[var(--muted-foreground)]">
          Autenticação será implementada via Supabase Auth.
        </p>
      </div>
    </div>
  );
}
