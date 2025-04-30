"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function ProductsAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Efecto para redirigir si el usuario no está autenticado o no es admin
  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && session?.user?.role !== "admin")
    ) {
      router.push("/auth/signin?callbackUrl=/admin");
    }
  }, [status, session, router]);

  // Cargar productos
  useEffect(() => {
    // Solo cargar productos si el usuario está autenticado y es admin
    if (status === "authenticated" && session?.user?.role === "admin") {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          const queryParams = new URLSearchParams();
          if (selectedCategory !== "all") {
            queryParams.set("category", selectedCategory);
          }
          queryParams.set("page", currentPage);
          queryParams.set("limit", 10); // 10 productos por página

          const response = await fetch(`/api/products?${queryParams}`);

          if (!response.ok) {
            throw new Error("Error al obtener productos");
          }

          const data = await response.json();
          setProducts(data.products);
          setTotalPages(data.pagination.pages);
        } catch (error) {
          console.error("Error al cargar productos:", error);
          toast.error("Error al cargar productos");
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }
  }, [selectedCategory, currentPage, status, session]);

  // Si está cargando, mostrar spinner
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Si no está autenticado o no es admin, no renderizar nada (la redirección ocurrirá en el useEffect)
  if (
    status === "unauthenticated" ||
    (status === "authenticated" && session?.user?.role !== "admin")
  ) {
    return null;
  }

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Eliminar producto
  const handleDeleteProduct = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar producto");
      }

      // Actualizar la lista de productos
      setProducts(products.filter((product) => product._id !== id));
      toast.success("Producto eliminado con éxito");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast.error("Error al eliminar producto");
    }
  };

  // Navegar por páginas
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Función para mostrar el precio de forma segura
  const displayPrice = (product) => {
    // Verificar si el producto tiene salePrice, si no, buscar price antiguo, y si no, usar 0
    const priceValue =
      product.salePrice !== undefined
        ? product.salePrice
        : product.price !== undefined
        ? product.price
        : 0;

    return priceValue.toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold mb-4 md:mb-0">
          Gestión de Productos
        </h1>

        <Link
          href="/admin/products/add"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Agregar Producto
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">Todas las categorías</option>
          <option value="ropa">Ropa</option>
          <option value="camisetas">Camisetas</option>
          <option value="pantalones">Pantalones</option>
          <option value="abrigos">Abrigos</option>
          <option value="calzado">Calzado</option>
          <option value="accesorios">Accesorios</option>
          <option value="electronica">Electrónica</option>
          <option value="hogar">Hogar</option>
          <option value="deporte">Deporte</option>
          <option value="otros">Otros</option>
        </select>
      </div>

      {/* Tabla de productos */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Imagen
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Categoría
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Precio
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Stock
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Destacado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-12 w-12 relative">
                          <Image
                            src={product.imageUrl}
                            alt={product.title}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category.charAt(0).toUpperCase() +
                            product.category.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${displayPrice(product)}
                        {product.promoPrice > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            Promo: ${product.promoPrice.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.featured ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Sí
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/products/edit/${product._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No se encontraron productos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                    currentPage === 1
                      ? "text-gray-300"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                    currentPage === totalPages
                      ? "text-gray-300"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * 10 + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, products.length)}
                    </span>{" "}
                    de <span className="font-medium">{products.length}</span>{" "}
                    resultados
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                        currentPage === 1
                          ? "text-gray-300"
                          : "text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
                      {/* Chevron left icon */}
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === i + 1
                            ? "bg-indigo-600 text-white"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                        currentPage === totalPages
                          ? "text-gray-300"
                          : "text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Siguiente</span>
                      {/* Chevron right icon */}
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
