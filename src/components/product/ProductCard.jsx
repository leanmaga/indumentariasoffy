"use client";

import Image from "next/image";
import Link from "next/link";
import PropTypes from "prop-types";
import { useCartStore } from "@/lib/store";
import { toast } from "react-hot-toast";
import StarRating from "../ui/StarRating";

const ProductCard = ({ product }) => {
  const addToCart = useCartStore((state) => state.addItem);

  // Determinar el precio a mostrar
  let regularPrice = 0;
  if (product.salePrice !== undefined) {
    regularPrice = product.salePrice;
  } else if (product.price !== undefined) {
    regularPrice = product.price;
  }

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
          {/* Botón de WhatsApp en esquina superior derecha */}
          <button
            onClick={(e) => {
              e.preventDefault();
              const message = encodeURIComponent(
                `Hola! Me interesa este producto: ${product.title}`
              );
              const phoneNumber = "+5491126907696"; // Cambia por tu número
              window.open(
                `https://wa.me/${phoneNumber}?text=${message}`,
                "_blank"
              );
            }}
            className="absolute top-2 right-2 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
            style={{ backgroundColor: "#F1ECE8" }}
            aria-label="Consultar por WhatsApp"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"
                fill="#25D366"
              />
            </svg>
          </button>

          {/* Mostrar etiqueta de agotado si no hay stock */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 text-sm font-medium">
                AGOTADO
              </span>
            </div>
          )}
          {/* Botón de quick add con color violeta */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
            }}
            className={`absolute bottom-0 left-0 right-0 bg-indigo-500 text-white py-3 transform translate-y-full transition-transform duration-200 group-hover:translate-y-0 font-medium ${
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
        <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
          <Link
            href={`/products/${product._id}`}
            className="hover:text-gray-600 transition"
          >
            {product.title}
          </Link>
        </h3>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {product.description}
        </p>

        {/* Precio y descuento */}
        <div className="flex items-end justify-between mb-8">
          <div className="price-container">
            <div className="flex items-baseline space-x-2">
              {hasPromotion ? (
                <>
                  <span className="price-main text-4xl font-black text-indigo-500">
                    ${displayPrice.toFixed(2)}
                  </span>
                  <span className="text-gray-400 line-through text-sm">
                    ${regularPrice.toFixed(2)}
                  </span>
                  <span className="text-red-600 text-sm">
                    | {discountPercentage}% OFF
                  </span>
                </>
              ) : (
                <span className="price-main text-4xl font-black text-indigo-500">
                  ${displayPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
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

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string.isRequired,
    price: PropTypes.number,
    salePrice: PropTypes.number,
    promoPrice: PropTypes.number,
    stock: PropTypes.number.isRequired,
    rating: PropTypes.number,
    numReviews: PropTypes.number,
    variants: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
};

export default ProductCard;
