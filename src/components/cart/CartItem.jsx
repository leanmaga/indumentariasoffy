"use client";

import Image from "next/image";
import { useCartStore } from "@/lib/store";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();

  const handleIncrease = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      handleRemove();
    }
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      {/* Imagen del producto */}
      <div className="relative h-16 w-16 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.title}
          sizes="64px"
          className="object-cover rounded"
        />
      </div>

      {/* Detalles del producto */}
      <div className="flex-1">
        <h3 className="font-medium text-gray-800">{item.title}</h3>
        <p className="text-gray-600">${item.price.toFixed(2)}</p>

        {/* Control de cantidad */}
        <div className="flex items-center mt-2">
          <button
            onClick={handleDecrease}
            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
            aria-label="Decrease quantity"
          >
            <MinusIcon className="h-4 w-4 text-gray-600" />
          </button>
          <span className="mx-2 w-6 text-center">{item.quantity}</span>
          <button
            onClick={handleIncrease}
            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
            aria-label="Increase quantity"
          >
            <PlusIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Total del item */}
      <div className="text-right">
        <p className="font-medium">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
        <button
          onClick={handleRemove}
          className="mt-1 text-red-500 hover:text-red-700 flex items-center justify-end"
          aria-label="Remove item"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
