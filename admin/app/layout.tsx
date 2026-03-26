import type { Metadata } from "next";
import "./globals.css";
import { NextAuthSessionProvider } from "@/app/components/SessionProvider";

export const metadata: Metadata = {
  title: "Panel de Administración - Majo Villafaina",
  description: "Panel de administración para Majo Villafaina Feldenkrais",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
      </body>
    </html>
  );
}
