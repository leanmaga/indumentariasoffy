"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import MercadoPagoButton from "@/components/mercadopago/MercadoPagoButton";

// Componente interno que usa useSearchParams
function OrderConfirmationContent() {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");
  const preferenceId = searchParams.get("preferenceId");
  const mercadoPagoUrl = searchParams.get("mercadoPagoUrl");

  useEffect(() => {
    if (!orderId) {
      router.push("/cart");
      return;
    }

    // Opcional: Cargar detalles de la orden desde tu API
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data.order);
        }
      } catch (error) {
        console.error("Error al cargar detalles de la orden:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-6">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            ¡Orden Confirmada!
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Tu orden ha sido registrada correctamente.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-600 mb-2">
              Número de orden: <span className="font-medium">{orderId}</span>
            </p>
            <p className="text-gray-600">
              Para completar tu compra, realiza el pago con MercadoPago.
            </p>
          </div>

          {/* Botón de MercadoPago */}
          {preferenceId && (
            <div className="mb-6">
              <MercadoPagoButton
                preferenceId={preferenceId}
                fallbackUrl={mercadoPagoUrl}
                buttonText="Pagar con MercadoPago"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Link
              href="/products"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Seguir Comprando
            </Link>

            <Link
              href="/profile/orders"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Ver Mis Pedidos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
