"use client";

import { useCartStore } from "@/lib/store";
import Image from "next/image";
import { TrashIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

const CartItem = ({ item }) => {
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  return (
    <div className="py-6 flex flex-col sm:flex-row">
      {/* Imagen del producto */}
      <div className="flex-shrink-0 sm:w-24 mb-4 sm:mb-0">
        <div className="aspect-square relative bg-gray-100">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name || "Producto en carrito"}
              fill
              style={{ objectFit: "cover" }}
              className="rounded"
              sizes="(max-width: 768px) 100px, 100px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <span className="text-xs">Sin imagen</span>
            </div>
          )}
        </div>
      </div>

      {/* Detalles del producto */}
      <div className="flex-1 sm:ml-6 flex flex-col sm:flex-row sm:justify-between">
        <div className="mb-3 sm:mb-0">
          <h3 className="text-base font-medium mb-1">{item.name}</h3>

          {item.variant && (
            <p className="text-sm text-gray-500 mb-1">Talle: {item.variant}</p>
          )}

          <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
        </div>

        <div className="flex justify-between items-center sm:flex-col sm:items-end sm:justify-between">
          {/* Control de cantidad */}
          <div className="flex items-center border border-gray-300">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="px-2 py-1 text-black hover:bg-gray-100"
              disabled={item.quantity <= 1}
            >
              <MinusIcon className="h-3 w-3" />
            </button>

            <span className="px-3 py-1 text-sm border-l border-r border-gray-300">
              {item.quantity}
            </span>

            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="px-2 py-1 text-black hover:bg-gray-100"
            >
              <PlusIcon className="h-3 w-3" />
            </button>
          </div>

          {/* Precio total y botón de eliminar */}
          <div className="flex items-center mt-3">
            <span className="font-medium mr-4">
              ${(item.price * item.quantity).toFixed(2)}
            </span>

            <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-black"
              aria-label="Eliminar producto"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
