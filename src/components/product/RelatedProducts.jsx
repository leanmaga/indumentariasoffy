"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/lib/store";
import { toast } from "react-hot-toast";

export default function RelatedProducts({ products = [] }) {
  const addToCart = useCartStore((state) => state.addItem);

  // Si no hay productos, mostrar array vacío
  const displayProducts = products.length > 0 ? products : [];

  const handleQuickAdd = (product) => {
    // Verificar stock
    if (!product.stock || product.stock <= 0) {
      toast.error("Producto agotado");
      return;
    }

    // Crear objeto del producto para el carrito (versión simplificada)
    const cartItem = {
      id: product._id,
      title: product.title,
      price:
        product.promoPrice > 0
          ? product.promoPrice
          : product.salePrice || product.price,
      image: product.imageUrl,
      quantity: 1,
    };

    // Añadir al carrito
    addToCart(cartItem);
    toast.success("Producto agregado al carrito");
  };

  if (displayProducts.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-semibold mb-8">
        Comprados frecuentemente juntos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {displayProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="aspect-square relative mb-4 bg-gray-50 rounded overflow-hidden">
              {product.imageUrl ? (
                <Link href={`/products/${product._id}`}>
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">Sin imagen</span>
                </div>
              )}
              <button
                onClick={() => handleQuickAdd(product)}
                disabled={!product.stock || product.stock <= 0}
                className="absolute right-2 top-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Agregar al carrito"
              >
                <PlusIcon className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            <Link href={`/products/${product._id}`} className="block">
              <h3 className="font-medium text-gray-800 hover:text-indigo-600 transition-colors mb-2 truncate">
                {product.title}
              </h3>
              <div className="mt-1">
                {product.promoPrice > 0 ? (
                  <div className="flex items-center">
                    <p className="text-black font-semibold">
                      ${product.promoPrice.toFixed(2)}
                    </p>
                    <p className="ml-2 text-sm text-gray-500 line-through">
                      ${(product.salePrice || product.price).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="text-black font-semibold">
                    ${(product.salePrice || product.price).toFixed(2)}
                  </p>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
