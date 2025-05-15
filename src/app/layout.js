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
