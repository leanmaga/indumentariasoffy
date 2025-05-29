import "./globals.css";
import "./fonts.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Providers } from "./providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

export const metadata = {
  title: "TiendaOnline – Tu E‑commerce de confianza",
  description: "Encuentra los mejores productos al mejor precio.",
  icons: {
    icon: [
      {
        url: "images/favicon_io/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "images/favicon_io/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    // shortcut icon (alias típico)
    shortcut: [{ url: "images/favicon_io/favicon.ico" }],
    // icono para iOS
    apple: [
      {
        url: "images/favicon_io/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    // manifest del PWA (si lo usas)
    other: [{ rel: "manifest", url: "/site.webmanifest" }],
  },
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="es">
      <head>
        {/* Script correcto de Cloudinary */}
        <Script
          src="https://widget.cloudinary.com/v2.0/global/all.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Providers session={session}>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
