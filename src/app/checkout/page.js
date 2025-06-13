"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/store";
import toast, { Toaster } from "react-hot-toast";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import MercadoPagoButton from "@/components/mercadopago/MercadoPagoButton";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("mercadopago");
  const [mercadoPagoUrl, setMercadoPagoUrl] = useState("");
  const [preferenceId, setPreferenceId] = useState("");
  const [orderId, setOrderId] = useState(null);
  const orderCreatedRef = useRef(false);
  const idempotencyKey = useRef(
    `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  );

  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, getTotal, clearCart } = useCartStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Añadir después de cargar los datos del usuario
  useEffect(() => {
    if (session?.user) {
      setValue("name", session.user.name || "");
      setValue("email", session.user.email || "");
      setValue("phone", session.user.phone || "");

      // Si el usuario se acaba de registrar con Google y no tiene teléfono
      if (session.user.needsPhoneUpdate && !session.user.phone) {
        toast(
          "Por favor, ingresa tu número de teléfono para completar tu perfil y continuar con la compra",
          {
            duration: 6000,
            icon: "🔔", // O cualquier icono de información
            style: {
              background: "#3498db",
              color: "#fff",
            },
          }
        );
        // Hacer focus en el campo de teléfono
        setTimeout(() => {
          const phoneInput = document.getElementById("phone");
          if (phoneInput) {
            phoneInput.focus();
          }
        }, 500);
      }
    }
  }, [session, setValue]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?redirect=/checkout");
    }
  }, [status, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (mounted && items.length === 0 && !orderId) {
      toast.error("Tu carrito está vacío");
      router.push("/products");
    }
  }, [mounted, items, router, orderId]);

  // Manejar retorno después de intento de pago
  useEffect(() => {
    // Verificar si regresa de un intento de pago
    const lastOrderId = sessionStorage.getItem("lastOrderId");
    const lastPreferenceId = sessionStorage.getItem("lastPreferenceId");
    const lastMercadoPagoUrl = sessionStorage.getItem("lastMercadoPagoUrl");

    if (lastOrderId && lastPreferenceId && !orderId && !preferenceId) {
      setOrderId(lastOrderId);
      setPreferenceId(lastPreferenceId);
      setMercadoPagoUrl(lastMercadoPagoUrl);
      orderCreatedRef.current = true;
    }
  }, [orderId, preferenceId]);

  if (!mounted || status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  const total = getTotal();

  // Función onSubmit mejorada - solo la parte relevante
  const onSubmit = async (data) => {
    if (isSubmitting || orderCreatedRef.current) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (orderId) {
        return;
      }

      const orderData = {
        items: items.map((item) => ({
          product: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.image,
        })),
        totalAmount: total,
        paymentMethod: selectedPaymentMethod,
        shippingInfo: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
        },
        idempotencyKey: idempotencyKey.current,
      };

      // Crear timeout para la solicitud
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        toast.error(
          "La solicitud está tardando demasiado. Por favor, inténtalo de nuevo."
        );
        setIsSubmitting(false);
      }, 30000);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error processing order");
      }

      const result = await response.json();

      setOrderId(result.orderId);
      orderCreatedRef.current = true;

      if (selectedPaymentMethod === "mercadopago" && result.paymentInfo?.id) {
        setPreferenceId(result.paymentInfo.id);

        // Determinar URL de redirección según el entorno
        const redirectUrl =
          process.env.NODE_ENV === "development"
            ? result.paymentInfo.sandbox_init_point ||
              result.paymentInfo.init_point
            : result.paymentInfo.init_point ||
              result.paymentInfo.sandbox_init_point;

        if (!redirectUrl) {
          throw new Error("No se recibió URL de redirección de MercadoPago");
        }

        setMercadoPagoUrl(redirectUrl);

        // Guardar datos en sessionStorage para recuperación
        sessionStorage.setItem("lastOrderId", result.orderId);
        sessionStorage.setItem("lastPreferenceId", result.paymentInfo.id);
        sessionStorage.setItem("lastMercadoPagoUrl", redirectUrl);

        // Mostrar mensaje de éxito
        toast.success("Orden creada. Redirigiendo a MercadoPago...");
      } else if (selectedPaymentMethod === "whatsapp") {
        toast.success("Orden creada para WhatsApp");
        clearCart();
        router.push("/checkout/success?method=whatsapp");
      } else {
        toast.success("Orden creada exitosamente");
        clearCart();
        router.push("/checkout/success");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("❌ Solicitud cancelada por timeout");
        toast.error("La solicitud fue cancelada. Inténtalo de nuevo.");
      } else {
        console.error("❌ Error en checkout:", error);
        toast.error(error.message || "Error al procesar el pago");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Componente de renderizado del botón MercadoPago mejorado
  const renderMercadoPagoButton = () => {
    if (!preferenceId) return null;

    return (
      <div className="bg-white p-8 border border-gray-200 rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Completar Pago</h1>

        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  ¡Orden creada exitosamente!
                </p>
                <p className="text-sm text-green-700">
                  Orden #{orderId?.substring(0, 8)} - Total: ${total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <p className="mb-6 text-gray-600">
            Para completar tu compra, haz clic en el botón de MercadoPago a
            continuación. Serás redirigido a una página segura para realizar el
            pago.
          </p>
        </div>

        <div className="w-full">
          <MercadoPagoButton
            preferenceId={preferenceId}
            fallbackUrl={mercadoPagoUrl}
            buttonText="Pagar con MercadoPago"
          />
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            ℹ️ Información importante:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Tu carrito se vaciará automáticamente después del pago exitoso
            </li>
            <li>
              • Recibirás un email de confirmación una vez completado el pago
            </li>
            <li>
              • Puedes pagar con tarjeta de crédito, débito o transferencia
              bancaria
            </li>
            <li>• El pago es 100% seguro y está protegido por MercadoPago</li>
          </ul>
        </div>

        <div className="mt-8 border-t pt-6">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <Link
              href="/products"
              className="hover:text-black transition-colors"
            >
              ← Seguir comprando
            </Link>
            <Link
              href="/profile/orders"
              className="hover:text-black transition-colors"
            >
              Ver mis pedidos →
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // En el return del componente, usar esta función:
  // Si ya tenemos preferenceId, mostrar solo el botón de MercadoPago
  if (preferenceId) {
    return (
      <div className="bg-white min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-md">
          {renderMercadoPagoButton()}
        </div>
      </div>
    );
  }

  // // Si ya tenemos preferenceId, mostrar solo el botón de MercadoPago
  // if (preferenceId) {
  //   return (
  //     <div className="bg-white min-h-screen py-12">
  //       <div className="container mx-auto px-4 max-w-md">
  //         <div className="bg-white p-8 border border-gray-200">
  //           <h1 className="text-2xl font-bold mb-6">Completar Pago</h1>
  //           <p className="mb-6 text-gray-600">
  //             Tu orden ha sido creada. Por favor, haz clic en el botón a
  //             continuación para completar el pago con MercadoPago.
  //           </p>

  //           <div className="w-full items-center ">
  //             <MercadoPagoButton
  //               preferenceId={preferenceId}
  //               fallbackUrl={mercadoPagoUrl}
  //               buttonText="Pagar con MercadoPago"
  //             />
  //           </div>

  //           <p className="text-sm text-gray-500 mt-6">
  //             Serás redirigido a MercadoPago para completar tu pago. Tu carrito
  //             se vaciará una vez completado el pago.
  //           </p>

  //           <div className="mt-8 border-t pt-6">
  //             <Link
  //               href="/profile/orders"
  //               className="text-black hover:underline font-medium"
  //             >
  //               Ver mis pedidos
  //             </Link>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8 text-center">
          Finalizar Compra
        </h1>

        <div className="lg:flex lg:gap-12">
          {/* Formulario de Checkout */}
          <div className="lg:w-2/3 mb-8 lg:mb-0">
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-gray-200">
                Información de Envío
              </h2>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Nombre */}
                  <div>
                    <label htmlFor="name" className="block text-sm mb-2">
                      Nombre Completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("name", {
                        required: "El nombre es requerido",
                      })}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm mb-2">
                      Correo Electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("email", {
                        required: "El correo electrónico es requerido",
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: "Correo electrónico inválido",
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label htmlFor="phone" className="block text-sm mb-2">
                      Teléfono
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("phone", {
                        required: "El teléfono es requerido",
                      })}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Dirección */}
                  <div>
                    <label htmlFor="address" className="block text-sm mb-2">
                      Dirección
                    </label>
                    <input
                      id="address"
                      type="text"
                      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("address", {
                        required: "La dirección es requerida",
                      })}
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label htmlFor="city" className="block text-sm mb-2">
                      Ciudad
                    </label>
                    <input
                      id="city"
                      type="text"
                      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("city", {
                        required: "La ciudad es requerida",
                      })}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  {/* Código Postal */}
                  <div>
                    <label htmlFor="postalCode" className="block text-sm mb-2">
                      Código Postal
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${
                        errors.postalCode ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("postalCode", {
                        required: "El código postal es requerido",
                      })}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-gray-200">
                  Método de Pago
                </h2>

                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div
                      className={`border p-4 text-center cursor-pointer ${
                        selectedPaymentMethod === "mercadopago"
                          ? "border-black bg-gray-50"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedPaymentMethod("mercadopago")}
                    >
                      <div className="flex justify-center mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-8 w-8 text-black"
                        >
                          <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                        </svg>
                      </div>
                      <p className="text-sm">MercadoPago</p>
                    </div>

                    <div
                      className={`border p-4 text-center cursor-pointer ${
                        selectedPaymentMethod === "credit_card"
                          ? "border-black bg-gray-50"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedPaymentMethod("credit_card")}
                    >
                      <div className="flex justify-center mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-8 w-8 text-black"
                        >
                          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                        </svg>
                      </div>
                      <p className="text-sm">Tarjeta de Crédito</p>
                    </div>

                    <div
                      className={`border p-4 text-center cursor-pointer ${
                        selectedPaymentMethod === "debit_card"
                          ? "border-black bg-gray-50"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedPaymentMethod("debit_card")}
                    >
                      <div className="flex justify-center mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-8 w-8 text-black"
                        >
                          <path d="M4 18v-7.5H2.5V9c0-1.1.9-2 2-2H20c1.1 0 2 .9 2 2v7c0 1.1-.9 2-2 2H4zm2-5.25h6.5v1.5H6v-1.5zm9 0H17v1.5h-2v-1.5z" />
                        </svg>
                      </div>
                      <p className="text-sm">Tarjeta de Débito</p>
                    </div>
                  </div>
                </div> */}

                <div className="mt-8 space-y-4">
                  {/* Botón de MercadoPago */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-drop py-3 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        <span>Pagar con MercadoPago - ${total.toFixed(2)}</span>
                      </>
                    )}
                  </button>

                  {/* Usar el componente WhatsAppButton pasando los datos del formulario */}
                  <WhatsAppButton
                    userData={watch()} // Pasar los datos actuales del formulario
                    isDisabled={isSubmitting}
                    handleBeforeSubmit={() => {
                      // Validar que el formulario sea correcto antes de continuar
                      const isValid = Object.keys(errors).length === 0;
                      if (!isValid) {
                        toast.error(
                          "Por favor completa correctamente todos los campos"
                        );
                      }
                      return isValid;
                    }}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Resumen de la Orden */}
          <div className="lg:w-1/3">
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 pb-4 border-b border-gray-200">
                Resumen de la Orden
              </h2>

              <div className="max-h-80 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center py-3 border-b"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title || "Producto en carrito"}
                        fill
                        sizes="64px"
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Envío</span>
                  <span>Por coordinar</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4">
                <Link
                  href="/cart"
                  className="text-black hover:underline flex items-center font-medium"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Volver al Carrito
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
