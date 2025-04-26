"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Componente interno que usa useSearchParams
function CategoryFilterContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "all";

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);

    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap justify-center mb-8 gap-2">
      <button
        className={`px-4 py-2 rounded-full ${
          currentCategory === "all"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        } transition`}
        onClick={() => handleCategoryChange("all")}
      >
        Todos
      </button>
      <button
        className={`px-4 py-2 rounded-full ${
          currentCategory === "ropa"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        } transition`}
        onClick={() => handleCategoryChange("ropa")}
      >
        Ropa
      </button>
      <button
        className={`px-4 py-2 rounded-full ${
          currentCategory === "electronica"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        } transition`}
        onClick={() => handleCategoryChange("electronica")}
      >
        Electrónica
      </button>
      <button
        className={`px-4 py-2 rounded-full ${
          currentCategory === "hogar"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        } transition`}
        onClick={() => handleCategoryChange("hogar")}
      >
        Hogar
      </button>
    </div>
  );
}

// Componente principal con Suspense
const CategoryFilter = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center mb-8 gap-2 opacity-50">
          Cargando categorías...
        </div>
      }
    >
      <CategoryFilterContent />
    </Suspense>
  );
};

export default CategoryFilter;
