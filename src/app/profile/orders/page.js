"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDate } from "@/lib/utils"; // Crea esta función si no existe

// Componente interno para manejar la carga de órdenes
function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Redirigir si no hay sesión
    if (status === "unauthenticated") {
      router.push("/auth/login?redirect=/profile/orders");
      return;
    }

    // Obtener órdenes solo si hay sesión
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile/orders");

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Datos recibidos:", data); // Para depuración
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
      setError(
        "No se pudieron cargar tus pedidos. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  // Estado de visualización para carga
  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  // Sin órdenes
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No tienes pedidos</h2>
        <p className="text-gray-600 mb-6">¡Realiza tu primera compra!</p>
        <Link
          href="/products"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Ver Productos
        </Link>
      </div>
    );
  }

  // Función para mostrar el estado de forma visual
  const getStatusBadge = (status) => {
    const statusMap = {
      pendiente: { color: "bg-yellow-100 text-yellow-800", text: "Pendiente" },
      pagado: { color: "bg-green-100 text-green-800", text: "Pagado" },
      enviado: { color: "bg-blue-100 text-blue-800", text: "Enviado" },
      entregado: { color: "bg-indigo-100 text-indigo-800", text: "Entregado" },
      cancelado: { color: "bg-red-100 text-red-800", text: "Cancelado" },
    };

    const statusInfo = statusMap[status] || {
      color: "bg-gray-100 text-gray-800",
      text: status,
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
      >
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis Pedidos</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número de Pedido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order._id.substring(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${order.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/profile/orders/${order._id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Ver detalles
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        }
      >
        <OrdersContent />
      </Suspense>
    </div>
  );
}
