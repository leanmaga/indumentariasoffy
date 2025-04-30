"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { toast } from "react-hot-toast";

const ProductCard = ({ product }) => {
  const addToCart = useCartStore((state) => state.addItem);

  // Determinar el precio a mostrar
  const regularPrice =
    product.salePrice !== undefined
      ? product.salePrice
      : product.price !== undefined
      ? product.price
      : 0;

  const hasPromotion = product.promoPrice && product.promoPrice > 0;
  const displayPrice = hasPromotion ? product.promoPrice : regularPrice;

  // Calcular porcentaje de descuento si hay promoción
  const discountPercentage = hasPromotion
    ? Math.round((1 - product.promoPrice / regularPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    // Si el producto tiene variantes, redirigir a la página de detalle
    if (product.variants && product.variants.length > 0) {
      window.location.href = `/products/${product._id}`;
      return;
    }

    // Verificar stock
    if (product.stock <= 0) {
      toast.error("Producto sin stock disponible");
      return;
    }

    // Añadir al carrito con el precio correcto
    addToCart({
      id: product._id,
      title: product.title,
      price: displayPrice, // Usar el precio que se muestra (regular o promocional)
      image: product.imageUrl,
      quantity: 1,
    });
    toast.success("Producto agregado al carrito");
  };

  return (
    <div className="product-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <Link href={`/products/${product._id}`}>
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover hover:scale-105 transition-all duration-300"
          />
          {/* Mostrar etiqueta de descuento si hay promoción */}
          {hasPromotion && (
            <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs font-bold">
              {discountPercentage}% OFF
            </div>
          )}
          {/* Mostrar etiqueta de agotado si no hay stock */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-md font-medium">
                Agotado
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg line-clamp-2">
            <Link
              href={`/products/${product._id}`}
              className="hover:text-indigo-600 transition"
            >
              {product.title}
            </Link>
          </h3>
          <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
            {product.category.charAt(0).toUpperCase() +
              product.category.slice(1)}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">
          {product.description}
        </p>
        <div className="flex justify-between items-center mt-auto">
          {/* Precio con formato según haya promoción o no */}
          <div className="flex flex-col">
            {hasPromotion ? (
              <>
                <span className="font-bold text-lg text-red-600">
                  ${displayPrice.toFixed(2)}
                </span>
                <span className="text-gray-500 text-sm line-through">
                  ${regularPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="font-bold text-lg">
                ${displayPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Botón de agregar al carrito (deshabilitado si no hay stock) */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`px-3 py-1 rounded-lg flex items-center ${
              product.stock <= 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 transition"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
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
            {product.variants && product.variants.length > 0
              ? "Ver opciones"
              : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
