// src/app/admin/settings/page.js
"use client";

import MercadoPagoLinkButton from "@/components/admin/MercadoPagoLinkButton";
import HeroImageUpload from "@/components/admin/HeroImageUpload";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");

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

  const tabs = [
    { id: "hero", label: "Imagen Principal", icon: "🖼️" },
    { id: "payments", label: "Pagos", icon: "💳" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Configuración del Sistema</h1>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* Hero Image Settings */}
        {activeTab === "hero" && (
          <section>
            <HeroImageUpload />
          </section>
        )}

        {/* Payments Settings */}
        {activeTab === "payments" && (
          <section>
            <h2 className="text-xl font-medium mb-4">Pagos y Facturación</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <MercadoPagoLinkButton />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
