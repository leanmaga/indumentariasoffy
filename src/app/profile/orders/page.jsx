// app/profile/orders/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Actualiza la ruta para que coincida con tu estructura (users plural)
        const response = await fetch("/api/users/orders?userOnly=true");

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("API no encontrada");
          }
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al cargar pedidos");
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
        setError(error.message || "Error al cargar los pedidos");
        toast.error(error.message || "No se pudieron cargar los pedidos");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Traducir estado de la orden
  const getStatusText = (status) => {
    const statusMap = {
      pendiente: { text: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
      pagado: { text: "Pagado", color: "bg-green-100 text-green-800" },
      enviado: { text: "Enviado", color: "bg-blue-100 text-blue-800" },
      entregado: { text: "Entregado", color: "bg-indigo-100 text-indigo-800" },
      cancelado: { text: "Cancelado", color: "bg-red-100 text-red-800" },
      whatsapp_pendiente: {
        text: "WhatsApp - Pendiente",
        color: "bg-green-100 text-green-800",
      },
    };

    return (
      statusMap[status] || { text: status, color: "bg-gray-100 text-gray-800" }
    );
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-sora-extralight text-xl font-semibold mb-6">
        Mis Pedidos
      </h2>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50 border-b flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Pedido #{order._id.substring(0, 8)}
                  </p>
                  <p className="text-sm">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex space-x-4 items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getStatusText(order.status).color
                    }`}
                  >
                    {getStatusText(order.status).text}
                  </span>
                  <Link
                    href={`/profile/orders/${order._id}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm underline"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {/* Productos - mostraremos solo los primeros 2 */}
                  {order.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-4">
                      <div className="h-16 w-16 relative flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.title || "Producto"}
                          fill
                          sizes="64px"
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Mostrar mensaje si hay más productos */}
                  {order.items.length > 2 && (
                    <p className="text-sm text-gray-500">
                      Y {order.items.length - 2}{" "}
                      {order.items.length - 2 === 1 ? "producto" : "productos"}{" "}
                      más
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-700">Total:</p>
                    <p className="text-lg font-medium">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">Método de pago:</p>
                    <p className="text-sm font-medium">
                      {order.paymentMethod === "mercadopago"
                        ? "MercadoPago"
                        : order.paymentMethod === "credit_card"
                        ? "Tarjeta de Crédito"
                        : order.paymentMethod === "debit_card"
                        ? "Tarjeta de Débito"
                        : order.paymentMethod === "whatsapp"
                        ? "WhatsApp"
                        : order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No has realizado ningún pedido aún.
          </p>
          <Link
            href="/products"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition inline-block"
          >
            Explorar Productos
          </Link>
        </div>
      )}
    </div>
  );
}
