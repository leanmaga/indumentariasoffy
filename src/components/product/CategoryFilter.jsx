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
    <div className="flex flex-wrap justify-center mb-8 gap-3">
      <button
        className={`px-5 py-2 rounded-full border transition-colors text-sm ${
          currentCategory === "all"
            ? "border-indigo-500 bg-indigo-500 text-white"
            : "border-gray-300 hover:border-black text-black"
        }`}
        onClick={() => handleCategoryChange("all")}
      >
        Todos
      </button>
      <button
        className={`px-5 py-2 rounded-full border transition-colors text-sm ${
          currentCategory === "ropa"
            ? "border-indigo-500 bg-indigo-500 text-white"
            : "border-gray-300 hover:border-black text-black"
        }`}
        onClick={() => handleCategoryChange("ropa")}
      >
        Ropa
      </button>
      <button
        className={`px-5 py-2 rounded-full border transition-colors text-sm ${
          currentCategory === "electronica"
            ? "border-indigo-500 bg-indigo-500 text-white"
            : "border-gray-300 hover:border-black text-black"
        }`}
        onClick={() => handleCategoryChange("electronica")}
      >
        Electrónica
      </button>
      <button
        className={`px-5 py-2 rounded-full border transition-colors text-sm ${
          currentCategory === "hogar"
            ? "border-indigo-500 bg-indigo-500 text-white"
            : "border-gray-300 hover:border-black text-black"
        }`}
        onClick={() => handleCategoryChange("hogar")}
      >
        Hogar
      </button>
      <button
        className={`px-5 py-2 rounded-full border transition-colors text-sm ${
          currentCategory === "ofertas"
            ? "border-indigo-500 bg-indigo-500 text-white"
            : "border-gray-300 hover:border-black text-black"
        }`}
        onClick={() => handleCategoryChange("ofertas")}
      >
        Ofertas
      </button>
      <button
        className={`px-5 py-2 rounded-full border transition-colors text-sm ${
          currentCategory === "camisetas"
            ? "border-indigo-500 bg-indigo-500 text-white"
            : "border-gray-300 hover:border-black text-black"
        }`}
        onClick={() => handleCategoryChange("camisetas")}
      >
        Camisetas
      </button>
      <button
        className={`px-5 py-2 rounded-full border transition-colors text-sm ${
          currentCategory === "pantalones"
            ? "border-indigo-500 bg-indigo-500 text-white"
            : "border-gray-300 hover:border-black text-black"
        }`}
        onClick={() => handleCategoryChange("pantalones")}
      >
        Pantalones
      </button>
      <button
        className={`px-5 py-2 rounded-full border transition-colors text-sm ${
          currentCategory === "abrigos"
            ? "border-indigo-500 bg-indigo-500 text-white"
            : "border-gray-300 hover:border-black text-black"
        }`}
        onClick={() => handleCategoryChange("abrigos")}
      >
        Abrigos
      </button>
      <button
        className={`px-5 py-2 rounded-full border transition-colors text-sm ${
          currentCategory === "calzado"
            ? "border-indigo-500 bg-indigo-500 text-white"
            : "border-gray-300 hover:border-black text-black"
        }`}
        onClick={() => handleCategoryChange("calzado")}
      >
        Calzado
      </button>
      <button
        className={`px-5 py-2 rounded-full border transition-colors text-sm ${
          currentCategory === "accesorios"
            ? "border-indigo-500 bg-indigo-500 text-white"
            : "border-gray-300 hover:border-black text-black"
        }`}
        onClick={() => handleCategoryChange("accesorios")}
      >
        Accesorios
      </button>
      <button
        className={`px-5 py-2 rounded-full border transition-colors text-sm ${
          currentCategory === "deporte"
            ? "border-indigo-500 bg-indigo-500 text-white"
            : "border-gray-300 hover:border-black text-black"
        }`}
        onClick={() => handleCategoryChange("deporte")}
      >
        Deporte
      </button>
      <button
        className={`px-5 py-2 rounded-full border transition-colors text-sm ${
          currentCategory === "otros"
            ? "border-indigo-500 bg-indigo-500 text-white"
            : "border-gray-300 hover:border-black text-black"
        }`}
        onClick={() => handleCategoryChange("otros")}
      >
        Otros
      </button>
    </div>
  );
}

// Componente principal con Suspense
const CategoryFilter = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center mb-8 gap-3 opacity-50">
          Cargando categorías...
        </div>
      }
    >
      <CategoryFilterContent />
    </Suspense>
  );
};

export default CategoryFilter;
