import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware de autenticação.
 * - Atualiza a sessão do Supabase (refresh de tokens via cookies)
 * - Redireciona para /login se o usuário não estiver autenticado
 *   ao tentar acessar rotas protegidas (dashboard)
 */
// Next.js 16: a função deve se chamar "proxy" (não mais "middleware")
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Atualiza a sessão — não remova esta chamada!
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rotas públicas (auth)
  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/cadastro") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/icons") ||
    pathname === "/manifest.json";

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redireciona usuário logado que tenta acessar /login
  if (user && (pathname === "/login" || pathname === "/cadastro")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Processa todas as rotas exceto arquivos estáticos e imagens do Next.js.
     * O service worker do PWA (sw.js) também é excluído para não conflitar.
     */
    "/((?!_next/static|_next/image|favicon.ico|sw.js|workbox-.*\\.js|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
