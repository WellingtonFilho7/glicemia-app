"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError("Erro ao criar conta: " + error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 2000);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Criar conta
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Seu diário de saúde gestacional
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cadastrar</CardTitle>
            <CardDescription>
              Crie sua conta para começar a registrar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-center text-sm text-green-700">
                Conta criada com sucesso! Redirecionando...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-[var(--muted-foreground)]">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-[var(--primary)]">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
