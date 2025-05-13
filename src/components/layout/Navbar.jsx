"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store";
import {
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import AuthModal from "@/components/auth/AuthModal";
import Image from "next/image";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  // Solo Zustand
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const cartItemsCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState("login");

  const isAdmin = session?.user?.role === "admin";

  const handleSignOut = () => {
    // Limpiar Zustand store
    clearCart();

    // Limpiar directamente localStorage para asegurarse
    localStorage.removeItem("cart-storage");

    // Cerrar sesión
    signOut({ callbackUrl: "/" });
  };

  const isActive = (path) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const openLoginModal = () => {
    setAuthModalView("login");
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalView("register");
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold flex items-center text-gray-900"
          >
            <span>
              {/* <ShoppingBagIcon className="h-5 w-5 mr-2" /> */}
              <Image
                src="/images/logo.jpeg"
                alt="Hero background"
                width={75}
                height={75}
                className="object-cover"
                priority
              />
            </span>
            {/*<span className="hidden sm:inline">IndumentariaSoffy</span>
            <span className="sm:hidden">Soffy</span>*/}
          </Link>

          <div
            className={`hidden md:flex space-x-6 ${
              isMobileMenuOpen ? "hidden" : ""
            }`}
          >
            <Link
              href="/"
              className={`uppercase font-medium text-sm hover:text-gray-600 transition ${
                isActive("/") ? "border-b-2 border-indigo-500" : ""
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/products"
              className={`uppercase font-medium text-sm hover:text-gray-600 transition ${
                isActive("/products") ? "border-b-2 border-indigo-500" : ""
              }`}
            >
              Productos
            </Link>
            <Link
              href="/contact"
              className={`uppercase font-medium text-sm hover:text-gray-600 transition ${
                isActive("/contact") ? "border-b-2 border-indigo-500" : ""
              }`}
            >
              Contacto
            </Link>
            {/* Admin link si el usuario es administrador */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`uppercase font-medium text-sm hover:text-gray-600 transition flex items-center ${
                  isActive("/admin") ? "border-b-2 border-indigo-500" : ""
                }`}
              >
                <ShieldCheckIcon className="h-4 w-4 mr-1" />
                Admin
              </Link>
            )}
          </div>

          {/* Sección derecha: Carrito, Usuario */}
          <div
            className={`flex items-center space-x-4 ${
              isMobileMenuOpen ? "hidden" : ""
            }`}
          >
            {!isAdmin && (
              <Link
                href="/cart"
                className="relative p-2 text-gray-700 hover:text-gray-900"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            )}

            {/* Botones según el estado de autenticación */}
            {!session ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={openLoginModal}
                  className="uppercase text-sm font-medium hover:text-gray-600 cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={openRegisterModal}
                  className="bg-indigo-500 text-white hover:text-black hover:bg-white uppercase text-xs px-4 py-2 font-medium hover:border-b-black transition cursor-pointer"
                >
                  Registrarse
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {isAdmin && (
                  <Link
                    href="/admin/products/add"
                    className="bg-indigo-500 text-white px-3 py-1 text-xs uppercase font-medium hover:bg-gray-800 transition flex items-center"
                  >
                    <span className="mr-1">+</span> Producto
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="text-sm uppercase font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
                >
                  Cerrar sesión
                </button>
                <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
          </div>

          <button
            className="md:hidden text-xl cursor-pointer"
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
          } border-t border-gray-200 bg-white`}
        >
          <div className="py-2 px-4 divide-y divide-gray-100">
            <div className="py-2">
              <Link
                href="/"
                className={`block py-2 px-2 uppercase text-sm font-medium ${
                  isActive("/") ? "text-indigo-500" : "text-gray-700"
                }`}
              >
                Inicio
              </Link>
              <Link
                href="/products"
                className={`block py-2 px-2 uppercase text-sm font-medium ${
                  isActive("/products") ? "text-indigo-500" : "text-gray-700"
                }`}
              >
                Productos
              </Link>
              <Link
                href="/contact"
                className={`block py-2 px-2 uppercase text-sm font-medium ${
                  isActive("/contact") ? "text-indigo-500" : "text-gray-700"
                }`}
              >
                Contacto
              </Link>
            </div>

            {session ? (
              <>
                <div className="py-2">
                  <Link
                    href="/profile"
                    className={`block py-2 px-2 uppercase text-sm font-medium ${
                      isActive("/profile") ? "text-indigo-500" : "text-gray-700"
                    }`}
                  >
                    Mi Perfil
                  </Link>

                  {!isAdmin && (
                    <Link
                      href="/cart"
                      className={`block py-2 px-2 uppercase text-sm font-medium flex items-center ${
                        isActive("/cart") ? "text-yellow-500" : "text-gray-700"
                      }`}
                    >
                      <ShoppingCartIcon className="h-4 w-4 mr-2" />
                      Mi Carrito
                      {cartItemsCount > 0 && (
                        <span className="ml-2 bg-yellow-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                          {cartItemsCount}
                        </span>
                      )}
                    </Link>
                  )}
                </div>

                {isAdmin && (
                  <div className="py-2">
                    <Link
                      href="/admin"
                      className={`block py-2 px-2 uppercase text-sm font-medium flex items-center ${
                        isActive("/admin") ? "text-yellow-500" : "text-gray-700"
                      }`}
                    >
                      <ShieldCheckIcon className="h-4 w-4 mr-2" />
                      Administración
                    </Link>
                    <Link
                      href="/admin/products/add"
                      className="block py-2 px-2 uppercase text-sm font-medium text-black bg-gray-100 mt-2 flex items-center"
                    >
                      <span className="mr-2">+</span>
                      Crear Producto
                    </Link>
                  </div>
                )}

                {/* Botón para cerrar sesión */}
                <div className="py-2">
                  <button
                    onClick={handleSignOut} // Usar la nueva función aquí también
                    className="block w-full py-3 px-4 uppercase text-sm font-medium text-center border border-gray-300 hover:bg-gray-50 cursor-pointer"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <div className="py-2">
                <button
                  onClick={openLoginModal}
                  className="block w-full py-3 px-4 uppercase text-sm font-medium text-center border border-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={openRegisterModal}
                  className="block w-full py-3 px-4 uppercase text-sm font-medium text-center bg-indigo-500 text-white mt-2 hover:bg-gray-800 cursor-pointer"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Modal de autenticación */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authModalView}
      />
    </>
  );
};

export default Navbar;
