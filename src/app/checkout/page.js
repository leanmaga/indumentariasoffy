"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/store";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import MercadoPagoButton from "@/components/mercadopago/MercadoPagoButton";

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
    formState: { errors },
  } = useForm();

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Autofill with user data if logged in
  useEffect(() => {
    if (session?.user) {
      setValue("name", session.user.name || "");
      setValue("email", session.user.email || "");
      setValue("phone", session.user.phone || "");
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

  if (!mounted || status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const total = getTotal();

  const onSubmit = async (data) => {
    // Evitar duplicados: comprobar si ya se está procesando o si ya se creó una orden
    if (isSubmitting || orderCreatedRef.current) {
      console.log(
        "Evitando envío duplicado - isSubmitting:",
        isSubmitting,
        "orderCreated:",
        orderCreatedRef.current
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Si ya tenemos un orderId, no crear otro pedido
      if (orderId) {
        console.log(
          "Ya existe un orderId, no creando pedido duplicado:",
          orderId
        );
        return;
      }

      // Preparar datos de la orden
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
        // Agregar clave de idempotencia para prevenir duplicados
        idempotencyKey: idempotencyKey.current,
      };

      console.log(
        "Enviando datos de orden:",
        JSON.stringify(orderData, null, 2)
      );

      // Enviar a la API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al procesar la orden");
      }

      const result = await response.json();
      console.log("Respuesta de API:", JSON.stringify(result, null, 2));

      // Guardar el ID de la orden para prevenir duplicados
      setOrderId(result.orderId);
      orderCreatedRef.current = true;

      // Si el pago es con MercadoPago, guardar el preferenceId
      if (selectedPaymentMethod === "mercadopago" && result.paymentInfo?.id) {
        setPreferenceId(result.paymentInfo.id);

        // Priorizar sandbox en ambiente de desarrollo
        const redirectUrl =
          result.paymentInfo.sandbox_init_point ||
          result.paymentInfo.init_point;
        setMercadoPagoUrl(redirectUrl);

        console.log("PreferenceId configurado:", result.paymentInfo.id);
        console.log("URL de redirección configurada:", redirectUrl);

        // Alternativa de respaldo: redirección manual
        if (!result.paymentInfo.id && redirectUrl) {
          console.log("Redirigiendo manualmente a MercadoPago...");
          window.location.href = redirectUrl;
        }
      } else {
        // Para otros métodos (tarjeta), mostrar éxito
        toast.success("Orden creada correctamente");
        clearCart();
        router.push("/checkout/success");
      }
    } catch (error) {
      toast.error(error.message || "Error al procesar el pago");
      console.error("Checkout error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si ya tenemos preferenceId, mostrar solo el botón de MercadoPago
  if (preferenceId) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-6">Completar Pago</h1>
            <p className="mb-6 text-gray-600">
              Tu orden ha sido creada. Por favor, haz clic en el botón a
              continuación para completar el pago con MercadoPago.
            </p>

            <MercadoPagoButton
              preferenceId={preferenceId}
              fallbackUrl={mercadoPagoUrl}
              buttonText="Pagar con MercadoPago"
            />

            <p className="text-sm text-gray-500 mt-6">
              Serás redirigido a MercadoPago para completar tu pago. Tu carrito
              se vaciará una vez completado el pago.
            </p>

            <div className="mt-8 border-t pt-6">
              <Link
                href="/profile/orders"
                className="text-indigo-600 hover:text-indigo-800"
              >
                Ver mis pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Finalizar Compra
        </h1>

        <div className="lg:flex lg:gap-8">
          {/* Formulario de Checkout */}
          <div className="lg:w-2/3 mb-8 lg:mb-0">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-gray-200">
                Información de Envío
              </h2>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Nombre */}
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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
                    <label htmlFor="email" className="block text-gray-700 mb-2">
                      Correo Electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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
                    <label htmlFor="phone" className="block text-gray-700 mb-2">
                      Teléfono (para coordinación de envío)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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
                    <label
                      htmlFor="address"
                      className="block text-gray-700 mb-2"
                    >
                      Dirección
                    </label>
                    <input
                      id="address"
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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
                    <label htmlFor="city" className="block text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      id="city"
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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
                    <label
                      htmlFor="postalCode"
                      className="block text-gray-700 mb-2"
                    >
                      Código Postal
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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

                <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-gray-200">
                  Método de Pago
                </h2>

                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div
                      className={`border rounded-lg p-4 text-center cursor-pointer ${
                        selectedPaymentMethod === "mercadopago"
                          ? "border-indigo-500 bg-indigo-50"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedPaymentMethod("mercadopago")}
                    >
                      <div className="flex justify-center mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-8 w-8 text-indigo-600"
                        >
                          <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                        </svg>
                      </div>
                      <p className="text-sm">MercadoPago</p>
                    </div>

                    <div
                      className={`border rounded-lg p-4 text-center cursor-pointer ${
                        selectedPaymentMethod === "credit_card"
                          ? "border-indigo-500 bg-indigo-50"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedPaymentMethod("credit_card")}
                    >
                      <div className="flex justify-center mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-8 w-8 text-indigo-600"
                        >
                          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                        </svg>
                      </div>
                      <p className="text-sm">Tarjeta de Crédito</p>
                    </div>

                    <div
                      className={`border rounded-lg p-4 text-center cursor-pointer ${
                        selectedPaymentMethod === "debit_card"
                          ? "border-indigo-500 bg-indigo-50"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedPaymentMethod("debit_card")}
                    >
                      <div className="flex justify-center mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-8 w-8 text-indigo-600"
                        >
                          <path d="M4 18v-7.5H2.5V9c0-1.1.9-2 2-2H20c1.1 0 2 .9 2 2v7c0 1.1-.9 2-2 2H4zm2-5.25h6.5v1.5H6v-1.5zm9 0H17v1.5h-2v-1.5z" />
                        </svg>
                      </div>
                      <p className="text-sm">Tarjeta de Débito</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        Proceder al Pago - ${total.toFixed(2)}
                      </>
                    )}
                  </button>
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Tus datos están seguros y protegidos
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Resumen de la Orden */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 pb-4 border-b border-gray-200">
                Resumen de la Orden
              </h2>

              <div className="max-h-80 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center py-3 border-b"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        sizes="64px"
                        className="object-cover"
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

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>Por coordinar</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/cart"
                  className="text-indigo-600 hover:text-indigo-800 flex items-center justify-center"
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
