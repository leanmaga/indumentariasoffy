"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store";
import { toast } from "react-hot-toast";

export default function AddToCartButton({ product }) {
  const addToCart = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Determinar qué precio usar (promocional o regular)
  const price =
    product.promoPrice && product.promoPrice > 0
      ? product.promoPrice
      : product.salePrice !== undefined
      ? product.salePrice
      : product.price;

  // Verificar si el producto tiene variantes
  const hasVariants = product.variants && product.variants.length > 0;

  // Verificar si el producto tiene stock disponible
  const hasStock = hasVariants
    ? selectedVariant
      ? selectedVariant.stock > 0
      : product.stock > 0
    : product.stock > 0;

  // Manejar selección de variante
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  // Manejar cambio de cantidad
  const incrementQuantity = () => {
    if (selectedVariant && quantity < selectedVariant.stock) {
      setQuantity(quantity + 1);
    } else if (!selectedVariant && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Manejar añadir al carrito
  const handleAddToCart = () => {
    // Verificar que se haya seleccionado una variante si el producto las tiene
    if (hasVariants && !selectedVariant) {
      toast.error("Por favor selecciona talle y color");
      return;
    }

    // Verificar stock
    if (!hasStock) {
      toast.error("Producto agotado");
      return;
    }

    setIsAdding(true);

    // Crear objeto del producto para el carrito
    const cartItem = {
      id: product._id,
      title: product.title,
      price: price,
      image: product.imageUrl,
      quantity: quantity,
      // Si hay variante seleccionada, incluir esa información
      ...(selectedVariant && {
        variant: {
          size: selectedVariant.size,
          color: selectedVariant.color,
          variantId: `${selectedVariant.size}-${selectedVariant.color}`,
        },
      }),
    };

    // Añadir al carrito
    addToCart(cartItem);
    toast.success("Producto agregado al carrito");

    // Resetear estado después de agregar
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* Selector de cantidad */}
      <div className="flex items-center mb-4">
        <label
          htmlFor="quantity"
          className="text-sm font-medium text-gray-700 mr-4"
        >
          Cantidad:
        </label>
        <div className="flex border border-gray-300 rounded-md">
          <button
            type="button"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="px-4 py-1 border-x border-gray-300 min-w-[40px] text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={incrementQuantity}
            disabled={
              hasVariants
                ? selectedVariant
                  ? quantity >= selectedVariant.stock
                  : true
                : quantity >= product.stock
            }
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      {/* Botón de agregar al carrito - Estilo drop.com */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding || !hasStock || (hasVariants && !selectedVariant)}
        className={`w-full py-4 font-semibold text-center rounded transition
          ${
            isAdding
              ? "bg-green-600 text-white"
              : !hasStock || (hasVariants && !selectedVariant)
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-900"
          } uppercase tracking-wider`}
      >
        {isAdding
          ? "Agregando..."
          : !hasStock
          ? "Agotado"
          : hasVariants && !selectedVariant
          ? "Selecciona una variante"
          : "Agregar al carrito"}
      </button>

      {/* Info de envío - Estilo drop.com */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Envío gratis en pedidos superiores a $5000</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>30 días de garantía en todos los productos</span>
        </div>
      </div>
    </div>
  );
}
