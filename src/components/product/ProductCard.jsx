"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { toast } from "react-hot-toast";

const ProductCard = ({ product }) => {
  const addToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      title: product.title,
      price: product.price,
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
          <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition flex items-center"
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
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
