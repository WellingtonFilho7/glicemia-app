import type { NextConfig } from "next";

// NOTA SOBRE PWA (service worker):
// @ducanh2912/next-pwa usa webpack para gerar o service worker.
// Next.js 16 usa Turbopack por padrão, que é incompatível com plugins webpack.
//
// Opções para ativar o service worker em produção:
//   1. next build --webpack  (força modo webpack, compatível com next-pwa)
//   2. Aguardar suporte nativo do next-pwa ao Turbopack
//
// O manifest.json + meta tags no layout já garantem instalabilidade PWA no mobile.
// O service worker (offline support) é o próximo passo após estabilizar o scaffold.

const nextConfig: NextConfig = {
  // Turbopack explícito — silencia o warning de config webpack
  turbopack: {},
};

export default nextConfig;
