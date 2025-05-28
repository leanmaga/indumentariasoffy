// app/order-summary/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp, FaArrowLeft, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";

export default function OrderSummaryPage() {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  useEffect(() => {
    try {
      const storedOrder = localStorage.getItem(`whatsapp_order_${orderId}`);
      if (storedOrder) {
        setOrderData(JSON.parse(storedOrder));
      } else {
        setError("Pedido no encontrado o expirado");
      }
    } catch (err) {
      setError("Error al cargar el pedido");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">No encontrado</h1>
          <p className="text-gray-600 mb-6">
            {error || "Pedido no encontrado o expirado"}
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition duration-200"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(orderData.timestamp);
  const formattedDate = new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Encabezado y navegación */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-700 hover:text-black transition duration-200"
          >
            <FaArrowLeft className="mr-2" />
            <span>Volver a la tienda</span>
          </Link>
        </div>

        {/* Estado del pedido */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
            <FaCheck className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="font-sora-thin text-3xl font-bold mb-2">
            ¡Pedido enviado con éxito!
          </h1>
          <p className="font-sora-extralight text-gray-600">
            Gracias por tu compra. Te contactaremos a la brevedad.
          </p>
        </div>

        {/* Contenedor principal */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Cabecera del pedido */}
          <div className="border-b p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="font-sora-regular text-2xl font-bold mb-1">
                  Resumen de Pedido
                </h2>
                {orderData.dbOrderId && (
                  <p className="text-gray-600">
                    <span className="font-sora-regular text-sm uppercase tracking-wider">
                      Pedido
                    </span>{" "}
                    #{orderData.dbOrderId.substring(0, 8)}
                  </p>
                )}
              </div>
              <div className="mt-2 md:mt-0 py-1 px-3 bg-gray-100 rounded text-gray-700 text-sm">
                {formattedDate}
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="p-6">
            <h3 className="font-sora-regular text-lg font-bold mb-4 pb-2 border-b">
              Detalles del pedido
            </h3>

            <div className="space-y-6">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-20 h-20 relative bg-gray-100 rounded overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name || item.title || "Producto"}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400 text-xs">
                          Sin imagen
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex-1">
                    <h4 className="font-medium text-black">
                      {item.name || item.title}
                    </h4>
                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center text-sm text-gray-600">
                      <div className="flex items-center">
                        <span>Cantidad: {item.quantity}</span>
                        {item.variant && (
                          <span className="ml-3 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            {item.variant}
                          </span>
                        )}
                      </div>
                      <span className="sm:ml-auto mt-1 sm:mt-0">
                        ${item.price.toFixed(2)} c/u
                      </span>
                    </div>
                  </div>

                  <div className="ml-4 text-right font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen de precios */}
            <div className="mt-8 pt-4 border-t">
              <div className="space-y-2">
                <div className="font-sora-regular flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${orderData.total.toFixed(2)}</span>
                </div>
                <div className="font-sora-regular flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>A coordinar</span>
                </div>
                <div className="font-sora-bold flex justify-between font-bold text-black text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Datos de contacto */}
            {orderData.userData && (
              <div className="mt-10 pt-6 border-t">
                <h3 className="font-sora-regular text-lg font-bold mb-4">
                  Datos de contacto
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-sora-regular font-medium mb-3 text-gray-700">
                      Información personal
                    </h4>
                    <div className="space-y-3">
                      {orderData.userData.name && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">
                            Nombre
                          </p>
                          <p className="font-medium">
                            {orderData.userData.name}
                          </p>
                        </div>
                      )}
                      {orderData.userData.email && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">
                            Email
                          </p>
                          <p className="font-medium">
                            {orderData.userData.email}
                          </p>
                        </div>
                      )}
                      {orderData.userData.phone && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">
                            Teléfono
                          </p>
                          <p className="font-medium">
                            {orderData.userData.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-sora-regular font-medium mb-3 text-gray-700">
                      Dirección de entrega
                    </h4>
                    <div className="space-y-3">
                      {orderData.userData.address && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">
                            Dirección
                          </p>
                          <p className="font-medium">
                            {orderData.userData.address}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        {orderData.userData.city && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">
                              Ciudad
                            </p>
                            <p className="font-medium">
                              {orderData.userData.city}
                            </p>
                          </div>
                        )}
                        {orderData.userData.postalCode && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">
                              Código Postal
                            </p>
                            <p className="font-medium">
                              {orderData.userData.postalCode}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de WhatsApp */}
            <div className="mt-10">
              <button
                onClick={() => {
                  const phoneNumber = "5491126907696";
                  const whatsappLink = `https://wa.me/${phoneNumber}`;
                  window.open(whatsappLink, "_blank");
                }}
                className="font-sora-regular w-full bg-green-600 text-white font-medium py-4 rounded hover:bg-green-700 transition duration-200 flex items-center justify-center"
              >
                <FaWhatsapp className="h-5 w-5 mr-2" />
                Contactar por WhatsApp
              </button>

              <Link
                href="/"
                className="font-sora-regular mt-4 block text-center text-gray-600 hover:text-black transition duration-200"
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
