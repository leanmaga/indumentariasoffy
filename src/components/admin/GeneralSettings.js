// src/components/admin/GeneralSettings.js
"use client";

import { useState, useEffect } from "react";

export default function GeneralSettings() {
  const [formData, setFormData] = useState({
    storeName: "",
    contactEmail: "",
    storeDescription: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Cargar configuración actual al montar el componente
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/general-settings");
      const data = await response.json();

      if (response.ok) {
        setFormData({
          storeName: data.storeName || "",
          contactEmail: data.contactEmail || "",
          storeDescription: data.storeDescription || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error);
      setMessage("Error al cargar la configuración");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/general-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Configuración guardada correctamente");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ " + (data.error || "Error al guardar"));
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      setMessage("❌ Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section>
        <h2 className="text-xl font-medium mb-4">Configuración de Tienda</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-medium mb-4">Configuración de Tienda</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Tienda
            </label>
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ej: Indumentaria Soffy"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de contacto
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ej: patagoniascript@indumentariasoffy.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción de la tienda
            </label>
            <textarea
              name="storeDescription"
              value={formData.storeDescription}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ej: Encuentra los mejores productos al mejor precio."
              required
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.includes("✅")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            💡 Información:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              • El <strong>nombre de la tienda</strong> aparece en el título de
              la página y metadatos
            </li>
            <li>
              • El <strong>email de contacto</strong> se usa para notificaciones
              y contacto
            </li>
            <li>
              • La <strong>descripción</strong> aparece en la página principal y
              metadatos SEO
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
