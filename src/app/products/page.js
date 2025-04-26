import { Suspense } from "react";
import { getProducts } from "@/lib/data";
import ProductGrid from "@/components/product/ProductGrid";
import CategoryFilter from "@/components/product/CategoryFilter";

export const metadata = {
  title: "Productos | TiendaOnline",
  description: "Explora nuestra amplia selección de productos de alta calidad.",
};

// Versión simplificada: obtiene todos los productos sin filtros previos
export default async function ProductsPage() {
  // Obtener todos los productos sin filtro de categoría
  const { products } = await getProducts();

  return (
    <section className="py-12 bg-gray-50">
      <Suspense fallback={<ProductsPageSkeleton />}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Todos los Productos
          </h1>

          <CategoryFilter />

          <ProductGrid products={products} />
        </div>
      </Suspense>
    </section>
  );
}

function ProductsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>

      <div className="flex justify-center mb-8 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg overflow-hidden shadow-md p-4 h-full animate-pulse"
          >
            <div className="h-48 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
