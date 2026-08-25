import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Berta CRM",
  description: "CRM de WhatsApp con agente IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
