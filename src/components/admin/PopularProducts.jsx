"use client";

import Link from "next/link";
import Image from "next/image";
import PropTypes from "prop-types";

/**
 * Componente que muestra una grilla de productos populares.
 * Recibe la lista de productos como prop.
 */
export default function PopularProducts({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.slice(0, 3).map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

PopularProducts.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      salePrice: PropTypes.number,
      price: PropTypes.number,
      promoPrice: PropTypes.number,
      imageUrl: PropTypes.string,
    })
  ).isRequired,
};

/**
 * Tarjeta individual de producto con estilo mejorado.
 */
function ProductCard({ product }) {
  // Asegurar que siempre tengamos un precio
  const basePrice =
    product.salePrice != null ? product.salePrice : product.price ?? 0;
  const promoPrice = product.promoPrice ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow duration-200 flex flex-col overflow-hidden">
      {/* Imagen cuadrada 1:1 */}
      <div className="relative w-full aspect-square bg-gray-100">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="200px"
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        {/* Título */}
        <h3 className="text-gray-900 text-lg font-medium mb-2 truncate">
          {product.title}
        </h3>

        {/* Precios */}
        <div className="flex items-baseline justify-between mb-3 space-x-2">
          <span className="text-gray-800 text-xl font-semibold whitespace-nowrap">
            ${basePrice.toFixed(2)}
          </span>
          {promoPrice > 0 && (
            <span className="text-red-500 text-sm font-medium truncate">
              Promo: ${promoPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Botón/ver detalles */}
        <Link
          href={`/admin/products/${product._id}`}
          className="self-start text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
        >
          Ver detalles →
        </Link>
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    salePrice: PropTypes.number,
    price: PropTypes.number,
    promoPrice: PropTypes.number,
    imageUrl: PropTypes.string,
  }).isRequired,
};
