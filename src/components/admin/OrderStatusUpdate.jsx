// components/admin/OrderStatusUpdate.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const OrderStatusUpdate = ({ order }) => {
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdateStatus = async () => {
    if (status === order.status) {
      toast.error("El estado seleccionado es el mismo que el actual");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${order._id}`, {
        // Cambia la ruta si es necesario
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }), // Usar status en lugar de newStatus
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado del pedido");
      }

      toast.success("Estado del pedido actualizado correctamente");
      router.refresh();
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
      toast.error("Error al actualizar el estado del pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Estado del Pedido
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="whatsapp_pendiente">WhatsApp - Pendiente</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <button
        onClick={handleUpdateStatus}
        disabled={loading || status === order.status}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition flex items-center justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed mt-5"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Actualizando...
          </>
        ) : (
          "Actualizar Estado"
        )}
      </button>
    </div>
  );
};

export default OrderStatusUpdate;
