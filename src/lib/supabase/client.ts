import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso em Client Components ("use client").
 * Usa cookies do browser para gerenciar a sessão.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
