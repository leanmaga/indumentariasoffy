"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClockIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/lib/store";

// Componente interno que usa useSearchParams
function CheckoutPendingContent() {
  const [orderId, setOrderId] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Limpiar carrito al cargar la página
    clearCart();

    // Obtener el ID de la orden desde los parámetros de búsqueda
    const externalReference = searchParams.get("external_reference");
    if (externalReference) {
      setOrderId(externalReference);
    }

    // Si hay un payment_id, podemos verificar el estado del pago
    const paymentId = searchParams.get("payment_id");
    if (paymentId) {
      // Opcional: consultar a la API para verificar el estado del pago
      // y redirigir a success o failure según corresponda
    }
  }, [clearCart, searchParams]);

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-yellow-100 mb-6">
            <ClockIcon className="h-10 w-10 text-yellow-600" />
          </div>

          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Pago en Proceso
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Tu pago está siendo procesado.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-600 mb-2">
              El estado de tu pago está pendiente de confirmación.
            </p>
            {orderId && (
              <p className="text-gray-600">
                Número de orden: <span className="font-medium">{orderId}</span>
              </p>
            )}
            <p className="text-gray-600 mt-2">
              Te enviaremos un correo electrónico cuando se confirme el pago.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Link
              href="/products"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Volver a la Tienda
            </Link>

            <Link
              href="/profile/orders"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
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
export default function CheckoutPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <CheckoutPendingContent />
    </Suspense>
  );
}
