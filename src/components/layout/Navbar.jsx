"use client";

import { useState, useEffect, useRef } from "react";
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
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import AuthModal from "@/components/auth/AuthModal";
import Image from "next/image";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const dropdownRef = useRef(null);

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
  const hasGoogleImage =
    session?.user?.image &&
    session.user.image.includes("googleusercontent.com");

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

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo - Siempre visible */}
          <Link
            href="/"
            className="text-xl font-bold flex items-center text-gray-900"
          >
            <span>
              <Image
                src="/images/logo.jpeg"
                alt="Logo"
                width={75}
                height={75}
                className="object-cover w-auto h-auto"
                priority
              />
            </span>
          </Link>

          {/* Menú de navegación - Solo desktop */}
          <div className="hidden md:flex space-x-6">
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

          {/* Sección de iconos - Vista desktop y móvil separada */}
          <div className="flex items-center">
            {/* Carrito - Solo visible en desktop o si no hay sesión en móvil */}
            {(!isAdmin || !session) && (
              <div className="hidden md:block">
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
              </div>
            )}

            {/* Botones de autenticación - Solo desktop */}
            {!session ? (
              <div className="hidden md:flex items-center space-x-2">
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
              <div className="hidden md:flex items-center space-x-3">
                {/* Botón + PRODUCTO - Solo desktop */}
                {isAdmin && (
                  <Link
                    href="/admin/products/add"
                    className="bg-indigo-500 text-white px-3 py-1 text-xs uppercase font-medium hover:bg-gray-800 transition flex items-center"
                  >
                    <span className="mr-1">+</span> Producto
                  </Link>
                )}

                {/* Dropdown perfil - Solo desktop */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    {hasGoogleImage ? (
                      <div className="h-8 w-8 rounded-full overflow-hidden">
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "Usuario"}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>

                  {/* Dropdown de perfil */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {session.user.email}
                          </p>
                        </div>
                        <Link
                          href="/profile"
                          className="font-sora-extralight block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Mi Perfil
                        </Link>
                        <Link
                          href="/profile/orders"
                          className="font-sora-extralight block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Mis Pedidos
                        </Link>
                        <Link
                          href="/profile/settings"
                          className="font-sora-extralight block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Configuración
                        </Link>
                        <div className="border-t border-gray-100">
                          <button
                            onClick={handleSignOut}
                            className="font-sora-extralight block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Versión móvil - Carrito + Menú hamburguesa en conjunto */}
            <div className="flex items-center space-x-1 md:hidden">
              {/* Carrito en móvil - Solo si no es admin y hay items */}
              {!isAdmin && cartItemsCount > 0 && (
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-700 hover:text-gray-900"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemsCount}
                  </span>
                </Link>
              )}

              {/* Menú hamburguesa */}
              <button
                className="p-2 text-gray-700 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menú"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu - Pantalla completa */}
        <div
          className={`md:hidden fixed inset-0 bg-white z-50 ${
            isMobileMenuOpen ? "block" : "hidden"
          }`}
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="container mx-auto px-4 py-3">
            {/* Cabecera del menú con logo y botón de cierre */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <Link href="/" className="text-xl font-bold flex items-center">
                <Image
                  src="/images/logo.jpeg"
                  alt="Logo"
                  width={65}
                  height={65}
                  className="object-cover w-auto h-auto"
                />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-700 hover:text-gray-900"
                aria-label="Cerrar menú"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(100vh-100px)]">
              {/* Sección superior: Usuario si está autenticado */}
              {session && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    {hasGoogleImage ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "Usuario"}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navegación principal */}
              <div className="mb-6">
                <h3 className="text-xs uppercase text-gray-500 font-medium mb-3 px-1">
                  Menú
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/"
                    className={`flex items-center py-3 px-3 rounded-lg ${
                      isActive("/")
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-sm font-medium">Inicio</span>
                  </Link>
                  <Link
                    href="/products"
                    className={`flex items-center py-3 px-3 rounded-lg ${
                      isActive("/products")
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-sm font-medium">Productos</span>
                  </Link>
                  <Link
                    href="/contact"
                    className={`flex items-center py-3 px-3 rounded-lg ${
                      isActive("/contact")
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-sm font-medium">Contacto</span>
                  </Link>
                  {!isAdmin && (
                    <Link
                      href="/cart"
                      className={`flex items-center py-3 px-3 rounded-lg ${
                        isActive("/cart")
                          ? "bg-yellow-50 text-yellow-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingCartIcon className="h-5 w-5 mr-3" />
                      <span className="text-sm font-medium">Carrito</span>
                      {cartItemsCount > 0 && (
                        <span className="ml-auto bg-yellow-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                          {cartItemsCount}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              </div>

              {/* Sección de cuenta - Solo si hay sesión */}
              {session && (
                <div className="mb-6">
                  <h3 className="text-xs uppercase text-gray-500 font-medium mb-3 px-1">
                    Mi Cuenta
                  </h3>
                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      className={`flex items-center py-3 px-3 rounded-lg ${
                        isActive("/profile")
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-sm font-medium">Mi Perfil</span>
                    </Link>
                    <Link
                      href="/profile/orders"
                      className={`flex items-center py-3 px-3 rounded-lg ${
                        isActive("/profile/orders")
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-sm font-medium">Mis Pedidos</span>
                    </Link>
                    <Link
                      href="/profile/settings"
                      className={`flex items-center py-3 px-3 rounded-lg ${
                        isActive("/profile/settings")
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-sm font-medium">Configuración</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Sección de administración - Solo si es admin */}
              {isAdmin && (
                <div className="mb-6">
                  <h3 className="text-xs uppercase text-gray-500 font-medium mb-3 px-1">
                    Administración
                  </h3>
                  <div className="space-y-1">
                    <Link
                      href="/admin"
                      className={`flex items-center py-3 px-3 rounded-lg ${
                        isActive("/admin")
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShieldCheckIcon className="h-5 w-5 mr-3" />
                      <span className="text-sm font-medium">
                        Panel de Administración
                      </span>
                    </Link>
                    <Link
                      href="/admin/products/add"
                      className="flex items-center py-3 px-3 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg mr-2">+</span>
                      <span className="text-sm font-medium">
                        Crear Producto
                      </span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Botones finales */}
              <div className="mt-auto pt-6">
                {session ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-center text-gray-700 hover:bg-gray-50"
                  >
                    Cerrar Sesión
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={openLoginModal}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-center text-gray-700 hover:bg-gray-50"
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      onClick={openRegisterModal}
                      className="w-full py-3 px-4 bg-indigo-500 rounded-lg text-sm font-medium text-center text-white hover:bg-indigo-600"
                    >
                      Registrarse
                    </button>
                  </div>
                )}
              </div>
            </div>
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
