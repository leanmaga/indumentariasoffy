"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { toast } from "react-hot-toast";
import StarRating from "../ui/StarRating";

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
    <div className="product-card bg-white h-full flex flex-col group">
      <Link href={`/products/${product._id}`}>
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
          {/* Mostrar etiqueta de agotado si no hay stock */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 text-sm font-medium">
                AGOTADO
              </span>
            </div>
          )}
          {/* Botón de quick add */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
            }}
            className={`absolute bottom-0 left-0 right-0 bg-black text-white py-3 transform translate-y-full transition-transform duration-200 group-hover:translate-y-0 ${
              product.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={product.stock <= 0}
          >
            {product.variants && product.variants.length > 0
              ? "SELECCIONAR OPCIONES"
              : "AÑADIR AL CARRITO"}
          </button>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        {/* Título del producto */}
        <h3 className="font-medium text-sm mb-2">
          <Link
            href={`/products/${product._id}`}
            className="hover:text-gray-600 transition"
          >
            {product.title}
          </Link>
        </h3>

        {/* Precio y descuento */}
        <div className="flex items-center gap-2 mb-2">
          {hasPromotion ? (
            <>
              <span className="font-medium">${displayPrice.toFixed(2)}</span>
              <span className="text-gray-400 line-through text-sm">
                ${regularPrice.toFixed(2)}
              </span>
              <span className="text-red-600 text-sm">
                | {discountPercentage}% OFF
              </span>
            </>
          ) : (
            <span className="font-medium">${displayPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Rating con StarRating component */}
        <div className="mb-2">
          <StarRating
            rating={product.rating || 0}
            numReviews={product.numReviews || 0}
            size="xs"
            showCount={true}
          />
        </div>

        {/* Stock info */}
        <div className="mt-auto">
          {product.stock > 0 && product.stock < 10 && (
            <span className="text-xs text-red-600">
              Solo {product.stock} en stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-xs text-gray-500">Agotado</span>
          )}
          {product.stock >= 10 && (
            <span className="text-xs text-green-600">En stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
