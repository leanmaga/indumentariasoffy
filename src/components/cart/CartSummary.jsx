"use client";

import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

const CartSummary = () => {
  const { items, getTotal } = useCartStore();
  const router = useRouter();
  const { data: session } = useSession();

  const total = getTotal();
  const isEmpty = items.length === 0;

  const handleCheckout = () => {
    if (!session) {
      // Si el usuario no está logueado, redirigir al login
      router.push("/auth/login?redirect=/checkout");
    } else {
      // Si está logueado, ir al checkout
      router.push("/checkout");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Resumen de Compra
      </h2>

      {isEmpty ? (
        <div className="flex flex-col items-center py-6 text-gray-500">
          <ShoppingBagIcon className="h-12 w-12 mb-3" />
          <p className="text-lg">Tu carrito está vacío</p>
          <button
            onClick={() => router.push("/products")}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Ver Productos
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {/* Subtotal */}
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>

            {/* Envío */}
            <div className="flex justify-between">
              <span className="text-gray-600">Envío</span>
              <span>Por coordinar</span>
            </div>

            {/* Línea divisoria */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Total */}
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Botón de checkout */}
          <button
            onClick={handleCheckout}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            disabled={isEmpty}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
            Proceder al Pago
          </button>

          {/* Información adicional */}
          <p className="mt-4 text-sm text-gray-500 text-center">
            * El costo de envío se coordinará después de la compra
          </p>
        </>
      )}
    </div>
  );
};

export default CartSummary;
