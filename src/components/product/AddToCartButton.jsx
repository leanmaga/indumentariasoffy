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
      {/* Selector de variantes (si aplica) */}
      {hasVariants && (
        <div className="space-y-4">
          {/* Selector de tallas */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Talle</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  // Verificar si hay variantes disponibles con este talle
                  const variantsWithSize = product.variants.filter(
                    (v) => v.size === size
                  );
                  const hasSizeInStock = variantsWithSize.some(
                    (v) => v.stock > 0
                  );

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        // Seleccionar primera variante disponible con este talle
                        const variant =
                          variantsWithSize.find((v) => v.stock > 0) ||
                          variantsWithSize[0];
                        handleVariantSelect(variant);
                      }}
                      disabled={!hasSizeInStock}
                      className={`px-3 py-1 border rounded-md text-sm 
                        ${
                          !hasSizeInStock
                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                            : selectedVariant && selectedVariant.size === size
                            ? "border-indigo-500 text-indigo-500"
                            : "border-gray-300 hover:border-indigo-500 hover:text-indigo-500"
                        }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selector de colores */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  // Verificar si hay variantes disponibles con este color
                  const variantsWithColor = product.variants.filter(
                    (v) => v.color === color
                  );
                  const hasColorInStock = variantsWithColor.some(
                    (v) => v.stock > 0
                  );

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        // Seleccionar primera variante disponible con este color
                        const variant =
                          variantsWithColor.find((v) => v.stock > 0) ||
                          variantsWithColor[0];
                        handleVariantSelect(variant);
                      }}
                      disabled={!hasColorInStock}
                      className={`px-3 py-1 border rounded-md text-sm 
                        ${
                          !hasColorInStock
                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                            : selectedVariant && selectedVariant.color === color
                            ? "border-indigo-500 text-indigo-500"
                            : "border-gray-300 hover:border-indigo-500 hover:text-indigo-500"
                        }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selector de cantidad */}
      <div className="flex items-center space-x-3">
        <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
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
          <span className="px-3 py-1 border-x border-gray-300 min-w-[40px] text-center">
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

      {/* Información de stock */}
      {hasVariants ? (
        selectedVariant && (
          <div className="text-sm text-gray-600">
            Stock disponible: {selectedVariant.stock} unidades
          </div>
        )
      ) : (
        <div className="text-sm text-gray-600">
          Stock disponible: {product.stock} unidades
        </div>
      )}

      {/* Botón de agregar al carrito */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding || !hasStock || (hasVariants && !selectedVariant)}
        className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md 
          ${
            isAdding
              ? "bg-green-600 text-white"
              : !hasStock || (hasVariants && !selectedVariant)
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          } transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {isAdding
          ? "Agregando..."
          : !hasStock
          ? "Agotado"
          : hasVariants && !selectedVariant
          ? "Selecciona una variante"
          : "Agregar al carrito"}
      </button>
    </div>
  );
}
