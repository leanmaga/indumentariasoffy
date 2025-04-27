"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

// Componente interno
function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?redirect=/profile/orders");
      return;
    }

    const fetchOrders = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/profile/orders");

          if (!response.ok) {
            throw new Error("Error al obtener pedidos");
          }

          const data = await response.json();

          // Verificar si data es un array antes de asignarlo
          if (Array.isArray(data)) {
            setOrders(data);
          } else if (data && Array.isArray(data.orders)) {
            // Compatibilidad con el formato anterior
            setOrders(data.orders);
          } else {
            console.error("Formato de datos inesperado:", data);
            setOrders([]);
          }
        } catch (error) {
          console.error("Error al cargar pedidos:", error);
          setOrders([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Helper para obtener la clase de estado
  const getStatusClass = (status) => {
    switch (status) {
      case "pagado":
        return "bg-green-100 text-green-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "enviado":
        return "bg-blue-100 text-blue-800";
      case "entregado":
        return "bg-indigo-100 text-indigo-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">No tienes pedidos aún.</p>
          <Link
            href="/products"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Explorar Productos
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    Pedido #{order._id ? order._id.substring(0, 8) : "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.createdAt
                      ? formatDate(order.createdAt)
                      : "Fecha no disponible"}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {order.status
                      ? order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-3">
                  {order.items && Array.isArray(order.items) ? (
                    order.items.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-gray-500">
                              {item.quantity} x $
                              {item.price ? item.price.toFixed(2) : "0.00"}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">
                          $
                          {item.price && item.quantity
                            ? (item.price * item.quantity).toFixed(2)
                            : "0.00"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      Información de productos no disponible
                    </p>
                  )}
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <p className="font-semibold">Total</p>
                  <p className="font-semibold">
                    ${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 flex justify-end">
                <Link
                  href={`/profile/orders/${order._id}`}
                  className="text-indigo-600 hover:text-indigo-800 transition"
                >
                  Ver detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente principal con Suspense
export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
