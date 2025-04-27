"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);

  // Limpiar el carrito al cargar la página
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-lg w-full text-center">
          <div className="flex justify-center mb-4">
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>

          <p className="text-gray-600 mb-4">
            Tu pedido ha sido procesado correctamente.
          </p>

          <div className="text-gray-600 mb-6">
            <p className="mb-2">
              Pronto recibirás un correo electrónico con los detalles de tu
              pedido.
            </p>
            <p>
              El vendedor se pondrá en contacto contigo para coordinar el envío
              utilizando la información proporcionada.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white border border-indigo-600 text-indigo-600 hover:bg-gray-50 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Seguir Comprando
            </Link>

            <Link
              href="/profile/orders"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Ver Mis Pedidos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
