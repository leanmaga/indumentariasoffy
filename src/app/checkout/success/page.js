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
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-6">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            ¡Pago Exitoso!
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Tu pedido ha sido procesado correctamente.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-600 mb-2">
              Pronto recibirás un correo electrónico con los detalles de tu
              pedido.
            </p>
            <p className="text-gray-600">
              El vendedor se pondrá en contacto contigo para coordinar el envío
              utilizando la información proporcionada.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Link
              href="/products"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Seguir Comprando
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
