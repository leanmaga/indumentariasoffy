"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function OrderDetailsPage({ params }) {
  const [order, setOrder] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();
  const orderId = params.id;

  // Obtener los detalles de la orden
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);

      try {
        if (status === "unauthenticated") {
          router.push("/auth/login?redirect=/profile/orders");
          return;
        }

        if (status === "authenticated") {
          const response = await fetch(`/api/orders/${orderId}`);

          if (!response.ok) {
            if (response.status === 404) {
              toast.error("Orden no encontrada");
              router.push("/profile/orders");
              return;
            }
            throw new Error("Error al obtener detalles de la orden");
          }

          const data = await response.json();
          setOrder(data.order);
          setPaymentDetails(data.paymentDetails);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(error.message || "Error al cargar la orden");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, router, status]);

  // Mostrar estado de carga
  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/profile/orders"
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
            Volver a Mis Pedidos
          </Link>
        </div>

        {order ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Encabezado */}
            <div className="p-6 border-b">
              <div className="flex flex-wrap justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Detalles de la Orden
                  </h1>
                  <p className="text-gray-600 mt-1">Orden #{order._id}</p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getStatusText(order.status).color
                    }`}
                  >
                    {getStatusText(order.status).text}
                  </span>
                </div>
              </div>
            </div>

            {/* Detalles generales */}
            <div className="p-6 border-b">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Información General
                  </h3>
                  <p className="text-gray-600">
                    <span className="font-medium">Fecha:</span>{" "}
                    {formatDate(order.createdAt)}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Método de pago:</span>{" "}
                    {order.paymentMethod === "mercadopago"
                      ? "MercadoPago"
                      : order.paymentMethod === "credit_card"
                      ? "Tarjeta de Crédito"
                      : order.paymentMethod === "debit_card"
                      ? "Tarjeta de Débito"
                      : order.paymentMethod}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Total:</span> $
                    {order.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Dirección de Envío
                  </h3>
                  <p className="text-gray-600">{order.shippingInfo.name}</p>
                  <p className="text-gray-600">{order.shippingInfo.address}</p>
                  <p className="text-gray-600">
                    {order.shippingInfo.city}, {order.shippingInfo.postalCode}
                  </p>
                  <p className="text-gray-600">{order.shippingInfo.phone}</p>
                  <p className="text-gray-600">{order.shippingInfo.email}</p>
                </div>
              </div>
            </div>

            {/* Detalles del pago de MercadoPago */}
            {paymentDetails && (
              <div className="p-6 border-b bg-indigo-50">
                <h3 className="text-lg font-semibold mb-2">
                  Detalles del Pago
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600">
                      <span className="font-medium">ID de pago:</span>{" "}
                      {paymentDetails.id}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Estado del pago:</span>{" "}
                      <span
                        className={`px-2 py-0.5 rounded ${
                          paymentDetails.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : paymentDetails.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {paymentDetails.status === "approved"
                          ? "Aprobado"
                          : paymentDetails.status === "pending"
                          ? "Pendiente"
                          : paymentDetails.status === "in_process"
                          ? "En proceso"
                          : paymentDetails.status === "rejected"
                          ? "Rechazado"
                          : paymentDetails.status}
                      </span>
                    </p>
                    {paymentDetails.payment_method_id && (
                      <p className="text-gray-600">
                        <span className="font-medium">Método:</span>{" "}
                        {paymentDetails.payment_method_id}
                      </p>
                    )}
                  </div>
                  <div>
                    {paymentDetails.date_approved && (
                      <p className="text-gray-600">
                        <span className="font-medium">
                          Fecha de aprobación:
                        </span>{" "}
                        {formatDate(paymentDetails.date_approved)}
                      </p>
                    )}
                    {paymentDetails.date_created && (
                      <p className="text-gray-600">
                        <span className="font-medium">Fecha de creación:</span>{" "}
                        {formatDate(paymentDetails.date_created)}
                      </p>
                    )}
                    {paymentDetails.installments && (
                      <p className="text-gray-600">
                        <span className="font-medium">Cuotas:</span>{" "}
                        {paymentDetails.installments}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lista de productos */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Productos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="relative h-12 w-12 flex-shrink-0 rounded overflow-hidden mr-4">
                              <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.title}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-right font-medium"
                      >
                        Total
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="p-6 bg-gray-50 border-t">
              <div className="flex flex-wrap gap-4 justify-end">
                <Link
                  href="/products"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Seguir Comprando
                </Link>

                {/* Si el pago está pendiente y es MercadoPago, mostrar botón para reintentar pago */}
                {order.status === "pendiente" &&
                  order.paymentMethod === "mercadopago" && (
                    <button
                      onClick={() => {
                        // Lógica para reintentar pago (opcional)
                        toast.info("Redirigiendo a la página de pago...");
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Reintentar Pago
                    </button>
                  )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              No se encontró la orden solicitada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
