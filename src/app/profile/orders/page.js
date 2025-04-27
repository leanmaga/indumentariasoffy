"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ProfileOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirigir si no hay sesión
    if (status === "unauthenticated") {
      router.push("/auth/login?redirect=/profile/orders");
      return;
    }

    // Obtener órdenes del usuario si está autenticado
    if (status === "authenticated") {
      fetchUserOrders();
    }
  }, [status, router]);

  const fetchUserOrders = async () => {
    try {
      const response = await fetch("/api/profile/orders");
      if (!response.ok) {
        throw new Error("No se pudieron cargar los pedidos");
      }
      const data = await response.json();
      setOrders(data.orders);
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener los pedidos:", err);
      toast.error(err.message || "Error al cargar los pedidos");
      setLoading(false);
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  // Traducir estado de la orden
  const getStatusText = (status) => {
    const statusMap = {
      pendiente: { text: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
      pagado: { text: "Pagado", color: "bg-green-100 text-green-800" },
      enviado: { text: "Enviado", color: "bg-blue-100 text-blue-800" },
      entregado: { text: "Entregado", color: "bg-indigo-100 text-indigo-800" },
      cancelado: { text: "Cancelado", color: "bg-red-100 text-red-800" },
    };

    return (
      statusMap[status] || { text: status, color: "bg-gray-100 text-gray-800" }
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Mis Pedidos</h1>
            <Link
              href="/profile"
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Volver a Mi Perfil
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h2 className="text-xl font-semibold mb-2">
                No tienes pedidos aún
              </h2>
              <p className="text-gray-600 mb-6">
                Realiza tu primera compra para ver tus pedidos aquí
              </p>
              <Link
                href="/products"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Explorar productos
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getStatusText(order.status).color
                          }`}
                        >
                          {getStatusText(order.status).text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${order.totalAmount.toFixed(2)}
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
        )}
      </div>
    </div>
  );
}
