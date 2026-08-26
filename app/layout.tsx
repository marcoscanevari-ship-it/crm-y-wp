import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZOKKIA CRM",
  description: "CRM de WhatsApp con agente IA",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;

  return (
    <html lang="es" className={theme === "dark" ? "dark" : undefined}>
      <body>{children}</body>
    </html>
  );
}
