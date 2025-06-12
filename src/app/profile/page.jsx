"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ShoppingBagIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  CogIcon,
  ShieldCheckIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Obtener datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Verificar que hay una sesión activa
        if (!session) {
          setLoading(false);
          return;
        }

        const response = await fetch("/api/users/profile");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Error al obtener datos del perfil"
          );
        }

        const data = await response.json();

        // Actualizar estados con la información del usuario
        setUserData(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });

        // Manejar órdenes recientes
        if (data.recentOrders) {
          // Si las órdenes ya vienen incluidas en la respuesta de perfil
          setRecentOrders(data.recentOrders);
        } else if (data.role !== "admin") {
          // Caso de respaldo: hacer una solicitud separada solo si es necesario
          try {
            const ordersResponse = await fetch(
              "/api/users/orders?userOnly=true&limit=3"
            );

            // ✅ MEJOR MANEJO DE ERRORES
            if (!ordersResponse.ok) {
              // Si es 404, el endpoint no existe
              if (ordersResponse.status === 404) {
                console.warn(
                  "Endpoint de órdenes no encontrado, intentando ruta alternativa"
                );

                // Intentar con la ruta alternativa
                const altResponse = await fetch("/api/profile/orders?limit=3");
                if (altResponse.ok) {
                  const altData = await altResponse.json();
                  setRecentOrders(
                    Array.isArray(altData) ? altData.slice(0, 3) : []
                  );
                }
                return;
              }

              // Si es 405, método no permitido
              if (ordersResponse.status === 405) {
                console.warn("Método no permitido en endpoint de órdenes");
                return;
              }

              // Otros errores
              throw new Error(
                `Error ${ordersResponse.status}: ${ordersResponse.statusText}`
              );
            }

            // ✅ VERIFICAR QUE LA RESPUESTA SEA JSON VÁLIDO
            const contentType = ordersResponse.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
              console.warn("La respuesta no es JSON válido");
              return;
            }

            const ordersData = await ordersResponse.json();

            // ✅ MANEJO SEGURO DE LA ESTRUCTURA DE DATOS
            if (ordersData.success && ordersData.orders) {
              setRecentOrders(ordersData.orders);
            } else if (Array.isArray(ordersData)) {
              setRecentOrders(ordersData.slice(0, 3));
            } else {
              console.warn(
                "Estructura de datos de órdenes inesperada:",
                ordersData
              );
            }
          } catch (orderError) {
            console.error("Error al obtener pedidos recientes:", orderError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el perfil");
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);

      // Actualizar la sesión
      await update({
        ...session,
        user: {
          ...session.user,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });

      toast.success("Perfil actualizado correctamente");
      setIsEditing(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo actualizar el perfil");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="p-8 bg-white rounded-lg shadow-md animate-pulse flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const hasGoogleImage = userData?.image && typeof userData.image === "string";
  const isAdmin = userData?.role === "admin";
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Contenido para administradores
  if (isAdmin) {
    return (
      <div>
        <h2 className="font-sora-extralight text-2xl font-bold mb-8 text-gray-800">
          Mi Perfil (Administrador)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal - Información Personal para Admin */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Información Personal
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                )}
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <div className="w-28 h-28 relative flex-shrink-0 rounded-full overflow-hidden bg-indigo-50 border-2 border-indigo-100">
                    {hasGoogleImage ? (
                      <Image
                        src={userData.image}
                        alt={userData.name || "Usuario"}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShieldCheckIcon className="h-12 w-12 text-indigo-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full">
                    {!isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase text-gray-500">
                            Nombre
                          </p>
                          <div className="flex items-center">
                            <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <p className="text-lg font-medium">
                              {userData.name || "Usuario"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase text-gray-500">
                            Email
                          </p>
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <p className="text-lg">{userData.email}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase text-gray-500">
                            Teléfono
                          </p>
                          <div className="flex items-center">
                            <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <p className="text-lg">
                              {userData.phone || "No especificado"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-xs font-medium uppercase text-gray-500 mb-1"
                          >
                            Nombre
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            placeholder="Tu nombre completo"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="block text-xs font-medium uppercase text-gray-500 mb-1"
                          >
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            placeholder="tu@email.com"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-xs font-medium uppercase text-gray-500 mb-1"
                          >
                            Teléfono
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            placeholder="+54 9 11 1234-5678"
                          />
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center disabled:opacity-70"
                          >
                            {submitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                <span>Guardando...</span>
                              </>
                            ) : (
                              <>
                                <CheckIcon className="h-4 w-4 mr-2" />
                                <span>Guardar Cambios</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                name: userData.name || "",
                                email: userData.email || "",
                                phone: userData.phone || "",
                              });
                            }}
                            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium flex items-center justify-center"
                          >
                            <XMarkIcon className="h-4 w-4 mr-2" />
                            <span>Cancelar</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {userData.googleAuth && (
                <div className="px-6 py-4 bg-indigo-50 border-t border-indigo-100">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-indigo-600 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="text-sm text-indigo-800 font-medium">
                      Cuenta vinculada con Google
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Panel de acceso rápido a funciones administrativas */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Panel de Administración
                </h3>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/admin/products"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <BuildingStorefrontIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Productos</p>
                    <p className="text-sm text-gray-500">Gestionar catálogo</p>
                  </div>
                </Link>

                <Link
                  href="/admin/orders"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pedidos</p>
                    <p className="text-sm text-gray-500">Gestionar pedidos</p>
                  </div>
                </Link>

                <Link
                  href="/admin/users"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Usuarios</p>
                    <p className="text-sm text-gray-500">Gestionar usuarios</p>
                  </div>
                </Link>

                <Link
                  href="/admin/products/add"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Agregar Producto</p>
                    <p className="text-sm text-gray-500">Nuevo producto</p>
                  </div>
                </Link>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Link
                  href="/admin"
                  className="flex items-center justify-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                >
                  <span>Ir al Dashboard</span>
                  <ChevronRightIcon className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>

          {/* Columna Lateral para Admin */}
          <div className="lg:col-span-1 space-y-6">
            {/* Estado de la cuenta - Admin */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Estado de la Cuenta
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Cuenta Administrativa</p>
                    <p className="text-sm text-gray-500">
                      Desde {formatDate(userData.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs uppercase font-medium text-gray-500 mb-2">
                    Tipo de cuenta
                  </p>
                  <div className="flex items-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Administrador
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Accesos rápidos - Admin */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Ajustes</h3>
              </div>
              <div>
                <Link
                  href="/profile/settings"
                  className="p-4 flex items-center hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <CogIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Configuración</p>
                    <p className="text-sm text-gray-500">Ajustes de cuenta</p>
                  </div>
                  <ChevronRightIcon className="ml-auto h-5 w-5 text-gray-400" />
                </Link>

                <Link
                  href="/"
                  className="p-4 flex items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Ir a la Tienda</p>
                    <p className="text-sm text-gray-500">Ver tienda pública</p>
                  </div>
                  <ChevronRightIcon className="ml-auto h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Contenido para usuarios normales (no administradores)
  return (
    <div>
      <h2 className="font-sora-thin text-2xl font-bold mb-8 text-gray-800">
        Mi Perfil
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal - Información Personal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            {/* Contenido para usuario normal... */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-sora-extralight text-lg font-semibold text-gray-800">
                Información Personal
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Editar
                </button>
              )}
            </div>

            {/* El resto del contenido para usuarios normales */}

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="w-28 h-28 relative flex-shrink-0 rounded-full overflow-hidden bg-indigo-50 border-2 border-indigo-100">
                  {hasGoogleImage ? (
                    <Image
                      src={userData.image}
                      alt={userData.name || "Usuario"}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="h-12 w-12 text-indigo-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full">
                  {!isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-gray-500">
                          Nombre
                        </p>
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <p className="text-lg font-medium">
                            {userData.name || "Usuario"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-gray-500">
                          Email
                        </p>
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <p className="text-lg">{userData.email}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-gray-500">
                          Teléfono
                        </p>
                        <div className="flex items-center">
                          <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <p className="text-lg">
                            {userData.phone || "No especificado"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-xs font-medium uppercase text-gray-500 mb-1"
                        >
                          Nombre
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                          placeholder="Tu nombre completo"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-xs font-medium uppercase text-gray-500 mb-1"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                          placeholder="tu@email.com"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-xs font-medium uppercase text-gray-500 mb-1"
                        >
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                          placeholder="+54 9 11 1234-5678"
                        />
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center disabled:opacity-70"
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              <span>Guardando...</span>
                            </>
                          ) : (
                            <>
                              <CheckIcon className="h-4 w-4 mr-2" />
                              <span>Guardar Cambios</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: userData.name || "",
                              email: userData.email || "",
                              phone: userData.phone || "",
                            });
                          }}
                          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium flex items-center justify-center"
                        >
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {userData.googleAuth && (
              <div className="px-6 py-4 bg-indigo-50 border-t border-indigo-100">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-indigo-600 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-sm text-indigo-800 font-medium">
                    Cuenta vinculada con Google
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actividad Reciente - Solo para usuarios normales */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-sora-extralight text-lg font-semibold text-gray-800">
                Mis Pedidos Recientes
              </h3>
              <Link
                href="/profile/orders"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
              >
                Ver todos
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                        <ShoppingBagIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Pedido #{order._id.substring(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <Link
                        href={`/profile/orders/${order._id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="mx-auto bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBagIcon className="h-8 w-8 text-gray-500" />
                  </div>
                  <h4 className="text-gray-600 font-medium mb-2">
                    No hay pedidos recientes
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Aún no has realizado ninguna compra.
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                  >
                    Explorar productos
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Lateral - Solo para usuarios normales */}
        <div className="lg:col-span-1 space-y-6">
          {/* Estado de la cuenta */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-sora-extralight text-lg font-semibold text-gray-800">
                Estado de la Cuenta
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <CheckIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Cuenta activa</p>
                  <p className="text-sm text-gray-500">
                    Desde {formatDate(userData.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs uppercase font-medium text-gray-500 mb-2">
                  Tipo de cuenta
                </p>
                <div className="flex items-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Usuario
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-sora-extralight text-lg font-semibold text-gray-800">
                Accesos Rápidos
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              <Link
                href="/profile/orders"
                className="p-4 flex items-center hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <ShoppingBagIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium">Mis Pedidos</p>
                  <p className="text-sm text-gray-500">Historial de compras</p>
                </div>
                <ChevronRightIcon className="ml-auto h-5 w-5 text-gray-400" />
              </Link>

              <Link
                href="/products"
                className="p-4 flex items-center hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Catálogo</p>
                  <p className="text-sm text-gray-500">Explorar productos</p>
                </div>
                <ChevronRightIcon className="ml-auto h-5 w-5 text-gray-400" />
              </Link>

              <Link
                href="/profile/settings"
                className="p-4 flex items-center hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Configuración</p>
                  <p className="text-sm text-gray-500">
                    Preferencias de cuenta
                  </p>
                </div>
                <ChevronRightIcon className="ml-auto h-5 w-5 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
