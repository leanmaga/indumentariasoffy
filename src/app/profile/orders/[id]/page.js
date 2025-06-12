"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
import {
  ArrowLeftIcon,
  ShoppingBagIcon,
  ClockIcon,
  TruckIcon,
  CreditCardIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function OrderDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
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

  const handleResendConfirmation = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/send-confirmation`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Email de confirmación reenviado exitosamente");
      } else {
        toast.error("Error al reenviar el email de confirmación");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al reenviar el email");
    }
  };

  // 🆕 FUNCIÓN MEJORADA PARA COMPLETAR PAGO (con detección correcta de ambiente)
  const handleCompletePayment = async () => {
    if (!order) return;

    setProcessingPayment(true);
    toast.loading("Redirigiendo a la página de pago...", {
      id: "payment-loading",
    });

    try {
      // Recrear la preferencia de pago para la orden existente
      const response = await fetch("/api/orders/recreate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al procesar el pago");
      }

      const result = await response.json();

      if (result.paymentInfo?.id) {
        // Actualizar orden como pendiente
        setOrder((prev) => ({
          ...prev,
          status: "pendiente",
        }));

        // 🔧 LÓGICA MEJORADA PARA SELECCIONAR URL CORRECTA
        let redirectUrl;

        // Prioridad: init_point (producción) -> sandbox_init_point (desarrollo/test)
        if (result.paymentInfo.init_point) {
          redirectUrl = result.paymentInfo.init_point;
          console.log("🚀 Usando URL de PRODUCCIÓN:", redirectUrl);
        } else if (result.paymentInfo.sandbox_init_point) {
          redirectUrl = result.paymentInfo.sandbox_init_point;
          console.log("🧪 Usando URL de SANDBOX:", redirectUrl);
        } else {
          throw new Error("No se pudo obtener la URL de pago");
        }

        toast.success("Redirigiendo a MercadoPago...", {
          id: "payment-loading",
        });

        // Pequeña pausa para que el usuario vea el mensaje
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      } else {
        throw new Error("No se pudo crear la preferencia de pago");
      }
    } catch (error) {
      console.error("Error al completar pago:", error);
      toast.error(error.message || "Error al procesar el pago", {
        id: "payment-loading",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  // 🆕 FUNCIÓN PARA CONTACTAR POR WHATSAPP
  const handleWhatsAppContact = () => {
    if (!order) return;

    const phoneNumber = "5491126907696"; // Tu número de WhatsApp
    const message = encodeURIComponent(
      `Hola, consulto por mi pedido #${order._id.substring(0, 8)}. 
      
Estado actual: ${getStatusText(order.status).text}
Total: $${order.totalAmount.toFixed(2)}
Fecha: ${formatDate(order.createdAt)}

¿Podrían ayudarme con el estado de mi pedido?`
    );

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  // Mostrar estado de carga
  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md animate-pulse flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }

  // Traducir estado de la orden
  const getStatusText = (status) => {
    const statusMap = {
      pendiente: {
        text: "Pendiente de Pago",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <ClockIcon className="h-5 w-5 mr-2" />,
      },
      pagado: {
        text: "Pago Confirmado",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircleIcon className="h-5 w-5 mr-2" />,
      },
      enviado: {
        text: "Enviado",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <TruckIcon className="h-5 w-5 mr-2" />,
      },
      entregado: {
        text: "Entregado",
        color: "bg-purple-50 text-purple-700 border-purple-200",
        icon: <CheckCircleIcon className="h-5 w-5 mr-2" />,
      },
      cancelado: {
        text: "Cancelado",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: <ClockIcon className="h-5 w-5 mr-2" />,
      },
      whatsapp_pendiente: {
        text: "Consulta WhatsApp",
        color: "bg-green-50 text-green-700 border-green-200",
        icon: <ClockIcon className="h-5 w-5 mr-2" />,
      },
    };

    return (
      statusMap[status] || {
        text: status,
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <ClockIcon className="h-5 w-5 mr-2" />,
      }
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
    <div className="bg-gray-100 py-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <Link
            href="/profile/orders"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a Mis Pedidos
          </Link>
        </div>

        {order ? (
          <>
            {/* Header con estado del pedido y número */}
            <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                      Pedido #{order._id.substring(0, 8)}
                    </h1>
                    <p className="text-gray-500 text-sm">
                      Realizado el {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div
                    className={`mt-4 sm:mt-0 px-4 py-2 rounded-md border ${
                      getStatusText(order.status).color
                    } flex items-center`}
                  >
                    {getStatusText(order.status).icon}
                    <span className="font-medium">
                      {getStatusText(order.status).text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress timeline */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="relative flex items-center w-full">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        ["pagado", "enviado", "entregado"].includes(
                          order.status
                        )
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      <CreditCardIcon className="h-4 w-4" />
                    </div>
                    <div
                      className={`h-1 flex-1 ${
                        ["pagado", "enviado", "entregado"].includes(
                          order.status
                        )
                          ? "bg-emerald-500"
                          : "bg-gray-200"
                      }`}
                    ></div>

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        ["enviado", "entregado"].includes(order.status)
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      <TruckIcon className="h-4 w-4" />
                    </div>
                    <div
                      className={`h-1 flex-1 ${
                        ["entregado"].includes(order.status)
                          ? "bg-emerald-500"
                          : "bg-gray-200"
                      }`}
                    ></div>

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        ["entregado"].includes(order.status)
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span className="pl-0">Pago confirmado</span>
                  <span className="ml-2">Enviado</span>
                  <span className="pr-0">Entregado</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Productos */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center">
                    <ShoppingBagIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-800">
                      Productos
                    </h2>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {order.items.map((item, index) => (
                      <div key={index} className="p-6 flex items-start">
                        <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                          <Image
                            src={item.imageUrl}
                            alt={item.title || "Producto"}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium text-gray-900">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Cantidad: {item.quantity}
                          </p>
                          <p className="text-sm text-gray-500">
                            Precio unitario: ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">Envío</span>
                      <span>Por coordinar</span>
                    </div>
                    <div className="border-t border-gray-200 mt-4 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">
                          Total
                        </span>
                        <span className="font-bold text-lg text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de envío y pago */}
              <div className="lg:col-span-1 space-y-6">
                {/* Información de envío */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Información de Envío
                    </h2>
                  </div>
                  <div className="p-6 space-y-3">
                    <div>
                      <h3 className="text-xs font-medium uppercase text-gray-500">
                        Destinatario
                      </h3>
                      <p className="mt-1">{order.shippingInfo.name}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium uppercase text-gray-500">
                        Dirección
                      </h3>
                      <p className="mt-1">{order.shippingInfo.address}</p>
                      <p>
                        {order.shippingInfo.city},{" "}
                        {order.shippingInfo.postalCode}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium uppercase text-gray-500">
                        Contacto
                      </h3>
                      <p className="mt-1">{order.shippingInfo.phone}</p>
                      <p className="text-sm text-gray-500">
                        {order.shippingInfo.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información de pago */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Método de Pago
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <CreditCardIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium">
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

                    {paymentDetails && (
                      <div className="mt-2 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">ID de pago:</span>{" "}
                          {paymentDetails.id}
                        </p>
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Estado:</span>{" "}
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
                        {paymentDetails.date_approved && (
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">
                              Fecha de aprobación:
                            </span>{" "}
                            {formatDate(paymentDetails.date_approved)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones del pedido */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Acciones
                    </h2>
                  </div>
                  <div className="p-6 space-y-3">
                    <Link
                      href="/profile/orders"
                      className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                    >
                      Ver todos mis pedidos
                    </Link>

                    <Link
                      href="/products"
                      className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                    >
                      Seguir comprando
                    </Link>

                    {/* 🆕 BOTÓN MEJORADO PARA COMPLETAR PAGO */}
                    {(order.status === "pendiente" ||
                      order.status === "cancelado") &&
                      order.paymentMethod === "mercadopago" && (
                        <button
                          onClick={handleCompletePayment}
                          disabled={processingPayment}
                          className="w-full flex items-center justify-center px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-md transition-colors"
                        >
                          {processingPayment ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <CreditCardIcon className="w-5 h-5 mr-2" />
                              Completar pago
                            </>
                          )}
                        </button>
                      )}

                    {/* REENVIAR CONFIRMACIÓN */}
                    {order.status === "pagado" && (
                      <button
                        onClick={handleResendConfirmation}
                        className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Reenviar confirmación por email
                      </button>
                    )}

                    {/* CONTACTO WHATSAPP MEJORADO */}
                    <button
                      onClick={handleWhatsAppContact}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Consultar por WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-red-100">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Pedido no encontrado</h2>
            <p className="text-gray-500 mb-6">
              No pudimos encontrar la información del pedido solicitado.
            </p>
            <Link
              href="/profile/orders"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-block"
            >
              Volver a mis pedidos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
