"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Agregar un item al carrito
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);

        if (existingItem) {
          // Si el item ya existe, actualizar la cantidad
          const updatedItems = currentItems.map((i) =>
            i.id === item.id
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
      updateQuantity: (id, quantity) => {
        const currentItems = get().items;
        if (quantity <= 0) {
          // Si la cantidad es 0 o menor, remover el item
          set({ items: currentItems.filter((i) => i.id !== id) });
        } else {
          // Actualizar la cantidad del item
          const updatedItems = currentItems.map((i) =>
            i.id === id ? { ...i, quantity } : i
          );
          set({ items: updatedItems });
        }
      },

      // Remover un item del carrito
      removeItem: (id) => {
        const currentItems = get().items;
        set({ items: currentItems.filter((i) => i.id !== id) });
      },

      // Vaciar el carrito
      clearCart: () => set({ items: [] }),

      // Calcular el total del carrito
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "cart-storage", // nombre para localStorage
    }
  )
);
