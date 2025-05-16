// app/layout.js (ACTUALIZADO)
import { Inter } from "next/font/google";
import "./globals.css";
import "./fonts.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TiendaOnline - Tu E-commerce de confianza",
  description: "Encuentra los mejores productos al mejor precio.",
  icons: {
    icon: [
      { url: "/images/favicon.ico", sizes: "any" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/images/apple-touch-icon.png", type: "image/png" },
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/images/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/images/android-chrome-512x512.png",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}
      >
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
