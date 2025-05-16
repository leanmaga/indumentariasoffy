import "./globals.css";
import "./fonts.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Providers } from "./providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "TiendaOnline - Tu E-commerce de confianza",
  description: "Encuentra los mejores productos al mejor precio.",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="es">
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
