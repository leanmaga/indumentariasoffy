// Nuevo archivo: components/CartCleaner.jsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/store";

export default function CartCleaner() {
  const { status } = useSession();
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Si no hay sesión activa, limpiar el carrito
    if (status === "unauthenticated") {
      clearCart();
      localStorage.removeItem("cart-storage");
    }
  }, [status, clearCart]);

  // Este componente no renderiza nada visible
  return null;
}
