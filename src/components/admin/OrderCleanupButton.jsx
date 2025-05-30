"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function OrderCleanupButton() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/cleanup-orders");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeCleanup = async () => {
    if (
      !confirm(
        "¿Estás seguro de ejecutar la limpieza de órdenes?\n\nEsto cancelará órdenes pendientes de más de 30 minutos."
      )
    ) {
      return;
    }

    setIsCleaning(true);
    try {
      const response = await fetch("/api/admin/cleanup-orders", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        await fetchStats(); // Actualizar estadísticas
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al ejecutar limpieza");
      }
    } catch (error) {
      console.error("Error en limpieza:", error);
      toast.error("Error al ejecutar limpieza");
    } finally {
      setIsCleaning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Limpieza de Órdenes Pendientes
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Cancela órdenes pendientes abandonadas automáticamente
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Actualizar estadísticas"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {stats && (
        <div className="space-y-4">
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.currentStats?.map((stat) => (
              <div key={stat._id} className="border rounded-md p-3 text-center">
                <div
                  className={`text-lg font-bold ${
                    stat._id === "pagado"
                      ? "text-green-600"
                      : stat._id === "pendiente" ||
                        stat._id === "whatsapp_pendiente"
                      ? "text-yellow-600"
                      : stat._id === "cancelado"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {stat.count}
                </div>
                <div className="text-xs text-gray-600 capitalize">
                  {stat._id === "whatsapp_pendiente"
                    ? "WhatsApp Pend."
                    : stat._id === "pendiente"
                    ? "Pendientes"
                    : stat._id === "pagado"
                    ? "Pagadas"
                    : stat._id === "cancelado"
                    ? "Canceladas"
                    : stat._id}
                </div>
              </div>
            ))}
          </div>

          {/* Alerta si hay órdenes para limpiar */}
          {stats.needsCleanup?.pendingToCancel > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg
                  className="h-5 w-5 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-yellow-800 font-medium">
                  ⚠️ {stats.needsCleanup.pendingToCancel} órdenes pendientes de
                  más de 30 minutos
                </span>
              </div>
              <p className="text-yellow-700 text-sm">
                Estas órdenes probablemente fueron abandonadas y pueden estar
                duplicadas.
              </p>
            </div>
          )}

          {/* Botón de limpieza */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              <p>
                <strong>La limpieza:</strong>
              </p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Cancela órdenes pendientes de +30 min</li>
                <li>• Previene duplicados futuros</li>
                <li>• Es segura y reversible</li>
              </ul>
            </div>

            <button
              onClick={executeCleanup}
              disabled={isCleaning || stats.needsCleanup?.pendingToCancel === 0}
              className="bg-yellow-50 text-yellow-700 py-2 px-4 rounded-md hover:bg-yellow-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 border border-yellow-200"
            >
              {isCleaning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-yellow-600"></div>
                  <span>Limpiando...</span>
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>
                    {stats.needsCleanup?.pendingToCancel > 0
                      ? `Limpiar (${stats.needsCleanup.pendingToCancel})`
                      : "Todo limpio ✅"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
