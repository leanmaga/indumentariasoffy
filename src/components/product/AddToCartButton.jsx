import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data";
import AddToCartButton from "@/components/product/AddToCartButton";

export async function generateMetadata({ params }) {
  const product = await getProductById(params.id);

  if (!product) {
    return {
      title: "Producto no encontrado | TiendaOnline",
      description: "El producto que buscas no está disponible",
    };
  }

  return {
    title: `${product.title} | TiendaOnline`,
    description: product.description,
  };
}

async function ProductContent({ id }) {
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Imagen del producto */}
          <div className="md:w-1/2 relative h-96 md:h-auto">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Detalles del producto */}
          <div className="md:w-1/2 p-8">
            <div className="mb-4">
              <Link
                href={`/products?category=${product.category}`}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {product.category.charAt(0).toUpperCase() +
                  product.category.slice(1)}
              </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {product.title}
            </h1>

            <p className="text-2xl font-bold text-indigo-600 mb-6">
              ${product.price.toFixed(2)}
            </p>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">
                Descripción
              </h2>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">
                Especificaciones
              </h2>
              <ul className="list-disc pl-5 text-gray-600">
                <li>
                  Categoría:{" "}
                  {product.category.charAt(0).toUpperCase() +
                    product.category.slice(1)}
                </li>
                <li>
                  Disponibilidad: {product.inStock ? "En stock" : "Agotado"}
                </li>
              </ul>
            </div>

            <AddToCartButton product={product} />

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">
                Métodos de pago
              </h2>
              <div className="flex space-x-4">
                <div className="bg-gray-100 rounded p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div className="bg-gray-100 rounded p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="bg-gray-100 rounded p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ params }) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductContent id={params.id} />
    </Suspense>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 h-96 bg-gray-200 animate-pulse"></div>
          <div className="md:w-1/2 p-8">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>

            <div className="mb-8">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>

            <div className="mb-8">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>

            <div className="h-10 bg-gray-200 rounded w-full mb-8"></div>

            <div className="h-1 bg-gray-200 w-full mb-8"></div>

            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="flex space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded"></div>
              <div className="h-10 w-10 bg-gray-200 rounded"></div>
              <div className="h-10 w-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
