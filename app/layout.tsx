import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TRPCProvider } from "@/components/ui/trpc-provider";
import { Providers } from "./providers";
import { ConditionalLayout } from "@/components/layout/conditional-layout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DopeCard - Votre Expérience de Carte Digitale Premium",
  description: "Révolutionnez la fidélisation client avec DopeCard, la première solution de fidélité avancée au Maroc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full bg-gradient-to-b from-blue-50 to-purple-50`}
      >
        <Providers>
          <ConditionalLayout>
            <TRPCProvider>
              {children}
            </TRPCProvider>
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}