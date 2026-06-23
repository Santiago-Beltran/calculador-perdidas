import type { Metadata, Viewport } from "next";
import { Fraunces, Poppins, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const serif = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--fuente-serif",
  display: "swap",
});

const sans = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--fuente-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fuente-mono",
  display: "swap",
});

const TITULO = "¿Cuánto se te está escapando? · Calculadora de oportunidades perdidas";
const DESCRIPCION =
  "Descubre, paso a paso y con tus números, cuánto dinero pierde tu inmobiliaria al año por oportunidades de arrendamiento sin seguimiento.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  applicationName: "Santiago Beltrán · Diagnóstico",
  authors: [{ name: "Santiago Beltrán" }],
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    locale: "es_CO",
    type: "website",
    siteName: "Santiago Beltrán",
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRIPCION,
  },
};

export const viewport: Viewport = {
  themeColor: "#152808",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
