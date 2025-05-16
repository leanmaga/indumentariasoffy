// app/profile/layout.jsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function ProfileLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/login?redirect=${pathname}`);
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-sora-extralight text-2xl font-bold mb-6">
            Mi Cuenta
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Barra de navegación lateral */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className={`font-sora-regular block px-4 py-2 rounded-md text-sm font-medium ${
                      pathname === "/profile"
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    href="/profile/orders"
                    className={`font-sora-regular block px-4 py-2 rounded-md text-sm font-medium ${
                      pathname === "/profile/orders" ||
                      pathname.startsWith("/profile/orders/")
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Mis Pedidos
                  </Link>
                  <Link
                    href="/profile/settings"
                    className={`font-sora-regular block px-4 py-2 rounded-md text-sm font-medium ${
                      pathname === "/profile/settings"
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Configuración
                  </Link>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
