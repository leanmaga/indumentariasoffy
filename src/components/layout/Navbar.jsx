"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store";
import {
  ShoppingBagIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const cartItemsCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const isAdmin = session?.user?.role === "admin";

  // Cerrar el menú mobile al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold flex items-center">
          <ShoppingBagIcon className="h-6 w-6 mr-2" /> IndumentariaSoffy
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-indigo-200 transition">
            Inicio
          </Link>
          <Link href="/products" className="hover:text-indigo-200 transition">
            Productos
          </Link>
          <Link href="/contact" className="hover:text-indigo-200 transition">
            Contacto
          </Link>
          {/* Añadir enlace de admin si el usuario es administrador */}
          {isAdmin && (
            <Link href="/admin" className="hover:text-indigo-200 transition">
              <span className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-1" />
                Administración
              </span>
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/cart" className="relative">
            <ShoppingBagIcon className="h-6 w-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {!session ? (
            <Link
              href="/auth/signin"
              className="bg-white text-indigo-600 px-4 py-1 rounded-full font-medium hover:bg-indigo-50 transition"
            >
              Iniciar Sesión
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Botón de acceso rápido a crear producto para administradores */}
              {isAdmin && (
                <Link
                  href="/admin/products/add"
                  className="bg-green-500 text-white px-3 py-1 rounded-full font-medium hover:bg-green-600 transition text-sm flex items-center"
                >
                  <span className="mr-1">+</span> Producto
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="bg-gray-200 text-gray-800 px-4 py-1 rounded-full font-medium hover:bg-gray-300 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

        <button
          className="md:hidden text-xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden ${
          isMobileMenuOpen ? "block" : "hidden"
        } bg-indigo-700 px-4 py-2`}
      >
        <Link href="/" className="block py-2 hover:bg-indigo-600 px-2 rounded">
          Inicio
        </Link>
        <Link
          href="/products"
          className="block py-2 hover:bg-indigo-600 px-2 rounded"
        >
          Productos
        </Link>
        <Link
          href="/contact"
          className="block py-2 hover:bg-indigo-600 px-2 rounded"
        >
          Contacto
        </Link>
        {/* Añadir enlace de admin en el menú móvil si el usuario es administrador */}
        {isAdmin && (
          <>
            <Link
              href="/admin"
              className="block py-2 hover:bg-indigo-600 px-2 rounded"
            >
              Administración
            </Link>
            <Link
              href="/admin/products/add"
              className="block py-2 hover:bg-indigo-600 px-2 rounded text-green-300"
            >
              + Crear Producto
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
