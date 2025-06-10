// app/products/[id]/page.js
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductReviews from "@/components/ProductReviews";
import StarRating from "@/components/ui/StarRating";
import RelatedProducts from "@/components/product/RelatedProducts";
import ProductImageSlider from "@/components/product/ProductImageSlider";

export async function generateMetadata({ params }) {
  const product = await getProductById(awaitedParams.id);

  if (!product) {
    return {
      title: "Producto no encontrado | IndumentariaSoffy",
      description: "El producto que buscas no está disponible",
    };
  }

  return {
    title: `${product.title} | IndumentariaSoffy`,
    description: product.description,
  };
}

async function ProductContent({ id }) {
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // Determinar el precio a mostrar (precio regular y promocional si existe)
  const regularPrice =
    product.salePrice !== undefined
      ? product.salePrice
      : product.price !== undefined
      ? product.price
      : 0;

  const hasPromotion = product.promoPrice && product.promoPrice > 0;
  const displayPrice = hasPromotion ? product.promoPrice : regularPrice;

  // Process images for slider - WITH DETAILED DEBUGGING
  let productImages = [];

  // Add main image if it exists
  if (product.imageUrl) {
    productImages.push(product.imageUrl);
  }

  // Add additional images if they exist
  if (product.additionalImages && Array.isArray(product.additionalImages)) {
    product.additionalImages.forEach((img, index) => {
      if (img && img.imageUrl) {
        productImages.push(img.imageUrl);
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-500 flex items-center space-x-2">
        <Link href="/" className="hover:text-indigo-600">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-indigo-600">
          Productos
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category}`}
          className="hover:text-indigo-600"
        >
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="md:flex">
          {/* Imagen del producto - 50% en desktop */}
          <div className="md:w-1/2 p-6">
            <ProductImageSlider images={productImages} product={product} />
          </div>

          {/* Detalles del producto - 50% en desktop */}
          <div className="md:w-1/2 p-8 flex flex-col">
            {/* Categoría */}
            <div className="mb-2">
              <Link
                href={`/products?category=${product.category}`}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {product.category.charAt(0).toUpperCase() +
                  product.category.slice(1)}
              </Link>
            </div>

            {/* Título del producto */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4 uppercase">
              {product.title}
            </h1>

            {/* Rating y Reviews */}
            <div className="flex items-center gap-4 mb-6">
              <StarRating rating={product.rating || 0} size="md" />
              <span className="text-gray-600">
                {product.numReviews || 0}{" "}
                {(product.numReviews || 0) === 1 ? "reseña" : "reseñas"}
              </span>
            </div>

            {/* Precio */}
            <div className="mb-8">
              {hasPromotion ? (
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-black">
                    ${displayPrice.toFixed(2)}
                  </p>
                  <p className="ml-3 text-lg text-gray-500 line-through">
                    ${regularPrice.toFixed(2)}
                  </p>
                  <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-md">
                    {Math.round((1 - product.promoPrice / regularPrice) * 100)}%
                    OFF
                  </span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-black">
                  ${displayPrice.toFixed(2)}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="mb-8">
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Stock info */}
            <div className="mb-6 text-sm text-gray-600">
              Stock disponible: {product.stock} unidades
              {product.stock > 5 ? (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  En stock
                </span>
              ) : product.stock > 0 ? (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Quedan pocas unidades
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Agotado
                </span>
              )}
            </div>

            {/* Selector de variantes */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-8">
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Talle
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:border-indigo-500 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Color
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:border-indigo-500 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botón de agregar al carrito */}
            <div className="mb-8">
              <AddToCartButton product={product} />
            </div>

            {/* Especificaciones - Expandible/Colapsable */}
            <div className="mt-2 pt-6 border-t border-gray-200">
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                  <span className="text-lg font-semibold text-gray-700">
                    Especificaciones
                  </span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      fill="none"
                      height="24"
                      shapeRendering="geometricPrecision"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <ul className="text-gray-600 mt-3 group-open:animate-fadeIn space-y-2 pl-4">
                  <li>
                    Categoría:{" "}
                    {product.category.charAt(0).toUpperCase() +
                      product.category.slice(1)}
                  </li>
                  <li>
                    Disponibilidad: {product.stock > 0 ? "En stock" : "Agotado"}
                  </li>
                  {product.material && <li>Material: {product.material}</li>}
                  {product.gender && (
                    <li>
                      Género:{" "}
                      {product.gender.charAt(0).toUpperCase() +
                        product.gender.slice(1)}
                    </li>
                  )}
                  {product.style && <li>Estilo: {product.style}</li>}
                  {product.season && (
                    <li>
                      Temporada:{" "}
                      {product.season.charAt(0).toUpperCase() +
                        product.season.slice(1)}
                    </li>
                  )}
                </ul>
              </details>
            </div>

            {/* Métodos de pago */}
            <div className="mt-2 pt-4 border-t border-gray-200">
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                  <span className="text-lg font-semibold text-gray-700">
                    Métodos de pago
                  </span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      fill="none"
                      height="24"
                      shapeRendering="geometricPrecision"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <div className="text-gray-600 mt-3 group-open:animate-fadeIn">
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
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      <RelatedProducts />

      {/* Sección de Reviews */}
      <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
        <ProductReviews productId={id} />
      </div>
    </div>
  );
}

export default async function ProductPage({ params }) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductContent id={params.id} />
    </Suspense>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="md:flex">
          {/* Skeleton para la imagen */}
          <div className="md:w-1/2 p-6">
            <div className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="flex mt-4 space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-gray-200 animate-pulse rounded-md"
                ></div>
              ))}
            </div>
          </div>

          {/* Skeleton para el contenido */}
          <div className="md:w-1/2 p-8">
            <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-2 mb-8">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-full mb-8"></div>
            <div className="h-px bg-gray-200 w-full my-6"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton para productos relacionados */}
      <div className="mt-12">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg h-64 animate-pulse"
            ></div>
          ))}
        </div>
      </div>

      {/* Skeleton para reviews */}
      <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-px bg-gray-200 w-full my-4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
