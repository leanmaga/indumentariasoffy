"use client";

import { useCartStore } from "@/lib/store";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import Link from "next/link";
import { ShoppingBagIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isEmpty = items.length === 0;

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8 text-center">
          Tu Carrito de Compras
        </h1>

        {isEmpty ? (
          <div className="max-w-md mx-auto text-center bg-white border border-gray-200 p-8">
            <ShoppingBagIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-500 mb-6">
              Parece que aún no has añadido productos al carrito.
            </p>
            <Link href="/products" className="btn-drop inline-block px-6 py-3">
              <span>Explorar Productos</span>
            </Link>
          </div>
        ) : (
          <div className="lg:flex lg:gap-12">
            {/* Lista de Items */}
            <div className="lg:w-2/3 mb-8 lg:mb-0">
              <div className="bg-white mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">
                    Productos ({items.length})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-black hover:text-red-600 text-sm"
                  >
                    Vaciar Carrito
                  </button>
                </div>

                <div className="divide-y border-t border-gray-200">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>

                <div className="mt-8">
                  <Link
                    href="/products"
                    className="text-black hover:underline flex items-center text-sm font-medium"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Continuar Comprando
                  </Link>
                </div>
              </div>
            </div>

            {/* Resumen del Carrito */}
            <div className="lg:w-1/3">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
