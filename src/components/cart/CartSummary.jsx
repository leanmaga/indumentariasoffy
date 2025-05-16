// components/cart/CartSummary.jsx
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
      router.push("/auth/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-6">Resumen de Compra</h2>

      {isEmpty ? (
        <div className="flex flex-col items-center py-6 text-gray-500">
          <ShoppingBagIcon className="h-12 w-12 mb-3" />
          <p className="text-lg">Tu carrito está vacío</p>
          <button
            onClick={() => router.push("/products")}
            className="mt-4 btn-drop w-full py-3"
          >
            <span>Ver Productos</span>
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {/* Subtotal */}
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>

            {/* Envío */}
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Envío</span>
              <span>Por coordinar</span>
            </div>

            {/* Total */}
            <div className="flex justify-between py-3 text-lg font-semibold border-t border-gray-200 mt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Un solo botón para proceder al checkout donde estarán ambas opciones */}
          <button
            onClick={handleCheckout}
            className="w-full btn-drop py-3 flex items-center justify-center mb-4"
            disabled={isEmpty}
          >
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
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
            </span>
          </button>

          {/* Información adicional */}
          <p className="mt-4 text-xs text-gray-500">
            * El costo de envío se coordinará después de la compra
          </p>
        </>
      )}
    </div>
  );
};

export default CartSummary;
