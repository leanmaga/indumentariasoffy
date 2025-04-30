"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-hot-toast";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Agregar un item al carrito
      addItem: (item) => {
        const currentItems = get().items;

        // Comprobar si el item ya existe, considerando variantes
        const existingItem = currentItems.find(
          (i) =>
            i.id === item.id &&
            // Si ambos tienen variante, verificar que sea la misma
            ((!i.variant && !item.variant) || // Ambos sin variante
              (i.variant &&
                item.variant &&
                i.variant.variantId === item.variant.variantId)) // Misma variante
        );

        if (existingItem) {
          // Si el item ya existe, actualizar la cantidad
          const updatedItems = currentItems.map((i) =>
            i.id === item.id &&
            ((!i.variant && !item.variant) ||
              (i.variant &&
                item.variant &&
                i.variant.variantId === item.variant.variantId))
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
          set({ items: updatedItems });
        } else {
          // Si es un nuevo item, añadirlo al carrito
          set({ items: [...currentItems, item] });
        }
      },

      // Actualizar la cantidad de un item en el carrito
      updateQuantity: (id, quantity, variantId = null) => {
        const currentItems = get().items;
        if (quantity <= 0) {
          // Si la cantidad es 0 o menor, remover el item
          set({
            items: currentItems.filter(
              (i) =>
                i.id !== id ||
                (variantId && i.variant && i.variant.variantId !== variantId)
            ),
          });
        } else {
          // Actualizar la cantidad del item
          const updatedItems = currentItems.map((i) =>
            i.id === id &&
            ((!variantId && !i.variant) ||
              (variantId && i.variant && i.variant.variantId === variantId))
              ? { ...i, quantity }
              : i
          );
          set({ items: updatedItems });
        }
      },

      // Remover un item del carrito
      removeItem: (id, variantId = null) => {
        const currentItems = get().items;
        set({
          items: currentItems.filter(
            (i) =>
              i.id !== id ||
              (variantId && i.variant && i.variant.variantId !== variantId)
          ),
        });
        toast.success("Producto eliminado del carrito");
      },

      // Vaciar el carrito
      clearCart: () => {
        set({ items: [] });
        toast.success("Carrito vaciado");
      },

      // Calcular el total del carrito
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      // Calcular el número total de items en el carrito
      getItemsCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage", // nombre para localStorage
    }
  )
);
