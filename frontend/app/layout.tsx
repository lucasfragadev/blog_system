import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Configuração de fontes otimizadas do Next.js (Google Fonts)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadados para SEO e título da aba do navegador
export const metadata: Metadata = {
  title: "Blog de Estudos",
  description: "Sistema Fullstack desenvolvido para aprendizado de Next.js e Node.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        // Aplicação das variáveis de fonte e classes base de cor (suporte a dark mode)
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        {children}
      </body>
    </html>
  );
}