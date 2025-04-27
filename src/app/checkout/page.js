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
                {/* [El resto del formulario continúa igual...] */}

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

          {/* Resumen de la Orden continúa igual... */}
        </div>
      </div>
    </div>
  );
}
