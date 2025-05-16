// app/order-summary/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp, FaArrowLeft } from "react-icons/fa";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-6">{error || "Pedido no encontrado"}</p>
        <Link href="/" className="text-primary-600 hover:underline">
          Volver a la página principal
        </Link>
      </div>
    );
  }

  const date = new Date(orderData.timestamp);
  const formattedDate = new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="mr-2" />
            Volver a la tienda
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden border">
          <div className="border-b bg-gray-50 p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Resumen de Pedido</h1>
              <span className="text-sm text-gray-500">{formattedDate}</span>
            </div>
            {orderData.dbOrderId && (
              <p className="text-sm text-gray-600 mt-1">
                ID del pedido: #{orderData.dbOrderId.substring(0, 8)}
              </p>
            )}
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Productos</h2>

            <div className="divide-y">
              {orderData.items.map((item, index) => (
                <div key={index} className="py-4 flex items-center">
                  <div className="flex-shrink-0 w-20 h-20 relative bg-gray-100 rounded overflow-hidden">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name || item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="ml-4 flex-1">
                    <h3 className="font-medium">{item.name || item.title}</h3>
                    {item.variant && (
                      <p className="text-sm text-gray-500">
                        Talle: {item.variant}
                      </p>
                    )}
                    <p className="text-sm text-gray-700">
                      {item.quantity} x ${item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold">
                  ${orderData.total.toFixed(2)}
                </span>
              </div>
            </div>

            {orderData.userData && (
              <div className="mt-6 pt-6 border-t">
                <h2 className="text-lg font-semibold mb-4">
                  Datos de Contacto
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orderData.userData.name && (
                    <div>
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p className="font-medium">{orderData.userData.name}</p>
                    </div>
                  )}

                  {orderData.userData.email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{orderData.userData.email}</p>
                    </div>
                  )}

                  {orderData.userData.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-medium">{orderData.userData.phone}</p>
                    </div>
                  )}

                  {orderData.userData.address && (
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="font-medium">
                        {orderData.userData.address}
                      </p>
                    </div>
                  )}

                  {orderData.userData.city && (
                    <div>
                      <p className="text-sm text-gray-500">Ciudad</p>
                      <p className="font-medium">{orderData.userData.city}</p>
                    </div>
                  )}

                  {orderData.userData.postalCode && (
                    <div>
                      <p className="text-sm text-gray-500">Código Postal</p>
                      <p className="font-medium">
                        {orderData.userData.postalCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-10">
              <button
                onClick={() => {
                  // Número de teléfono del vendedor
                  const phoneNumber = "5491112345678"; // CAMBIA ESTO
                  const whatsappLink = `https://wa.me/${phoneNumber}`;
                  window.open(whatsappLink, "_blank");
                }}
                className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 flex items-center justify-center"
              >
                <FaWhatsapp className="h-5 w-5 mr-2" />
                Contactar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
