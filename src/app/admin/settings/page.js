// src/app/admin/settings/page.js
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MercadoPagoLinkButton from "@/components/admin/MercadoPagoLinkButton";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Verificar que sea administrador
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin/settings");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  // Mostrar loading mientras se verifica la sesión
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // No renderizar nada si no es admin
  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Configuración del Sistema</h1>

      <div className="space-y-8">
        {/* Sección de MercadoPago */}
        <section>
          <h2 className="text-xl font-medium mb-4">Pagos y Facturación</h2>
          <MercadoPagoLinkButton />
        </section>

        {/* Otras configuraciones para admin */}
        <section>
          <h2 className="text-xl font-medium mb-4">Configuración de Tienda</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la tienda
                </label>
                <input
                  type="text"
                  defaultValue="IndumentariaSoffy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de contacto
                </label>
                <input
                  type="email"
                  defaultValue="info@indumentariasoffy.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Guardar cambios
              </button>
            </div>
          </div>
        </section>

        {/* Configuración de notificaciones */}
        <section>
          <h2 className="text-xl font-medium mb-4">
            Notificaciones Administrativas
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="newOrderNotifications"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="newOrderNotifications"
                  className="ml-3 text-sm text-gray-700"
                >
                  Notificar nuevos pedidos por email
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="lowStockNotifications"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="lowStockNotifications"
                  className="ml-3 text-sm text-gray-700"
                >
                  Alertas de stock bajo
                </label>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
