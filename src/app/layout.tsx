import type { Metadata, Viewport } from "next";
import "./globals.css";
// Nota: Google Fonts requer acesso à internet durante o build.
// Em produção (Vercel), Inter será carregada normalmente via next/font/google.
// Para ambiente sem internet, usamos system-ui (stack nativa do dispositivo).

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7C3AED",
};

export const metadata: Metadata = {
  title: "Glicemia App",
  description:
    "Diário de saúde gestacional com monitoramento de glicemia e análise por IA",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Glicemia App",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Glicemia App",
    description: "Diário de saúde gestacional com IA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
