"use client";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import CategoryFilter from "./CategoryFilter";
import ProductGrid from "./ProductGrid";

export default function FilterableProducts({ products }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filtrar primero por categoría
  const byCategory =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Luego filtrar por texto
  const filteredProducts = byCategory.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Pills de categorías */}
      <div className="mb-6">
        <CategoryFilter
          selected={selectedCategory}
          onChange={(cat) => setSelectedCategory(cat)}
        />
      </div>

      {/* Search centrado y con ancho limitado */}
      <div className="flex justify-center mb-8">
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Grid de productos */}
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
