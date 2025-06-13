// app/profile/layout.jsx - VERSIÓN SIMPLE SIN POLLING EXCESIVO
"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChatBubbleLeftRightIcon,
  InboxIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function ProfileLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Estados para notificaciones
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadQuestions, setUnreadQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/login?redirect=${pathname}`);
    }
  }, [status, router, pathname]);

  // ✅ SIMPLE: Solo una carga inicial cuando se autentica
  useEffect(() => {
    if (session?.user && status === "authenticated") {
      fetchUnreadCounts();
    }
  }, [session?.user?.id]); // ✅ Solo cuando cambia el ID del usuario

  // ✅ Función simple de fetch
  const fetchUnreadCounts = async () => {
    if (!session?.user || loading) return;

    setLoading(true);
    try {
      const response = await fetch("/api/messages/unread-count");
      if (response.ok) {
        const data = await response.json();

        if (session.user.role === "admin") {
          setUnreadQuestions(data.pendingQuestions || 0);
        } else {
          setUnreadMessages(data.unreadResponses || 0);
        }

        setLastFetch(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("❌ Error fetching unread counts:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Función para refresh manual
  const handleRefresh = () => {
    fetchUnreadCounts();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-sora-extralight text-2xl font-bold">
              Mi Cuenta
            </h1>

            {/* ✅ NUEVO: Botón de refresh manual */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              title="Actualizar contadores"
            >
              <ArrowPathIcon
                className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          {/* ✅ DEBUG temporal (remover después) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <strong>DEBUG:</strong> Última actualización:{" "}
              {lastFetch || "Nunca"} |
              {isAdmin
                ? ` Preguntas pendientes: ${unreadQuestions}`
                : ` Mensajes no leídos: ${unreadMessages}`}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Barra de navegación lateral */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className={`font-sora-regular block px-4 py-2 rounded-md text-sm font-medium ${
                      pathname === "/profile"
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Mi Perfil
                  </Link>

                  <Link
                    href="/profile/orders"
                    className={`font-sora-regular block px-4 py-2 rounded-md text-sm font-medium ${
                      pathname === "/profile/orders" ||
                      pathname.startsWith("/profile/orders/")
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Mis Pedidos
                  </Link>

                  {/* Sección de Mensajes */}
                  <Link
                    href={isAdmin ? "/profile/questions" : "/profile/messages"}
                    className={`font-sora-regular block px-4 py-2 rounded-md text-sm font-medium relative ${
                      pathname === "/profile/messages" ||
                      pathname === "/profile/questions" ||
                      pathname.startsWith("/profile/messages/") ||
                      pathname.startsWith("/profile/questions/")
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {isAdmin ? (
                          <InboxIcon className="h-4 w-4 mr-2" />
                        ) : (
                          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                        )}
                        {isAdmin ? "Preguntas" : "Mis Mensajes"}
                      </div>

                      {/* Badge de notificaciones */}
                      {((isAdmin && unreadQuestions > 0) ||
                        (!isAdmin && unreadMessages > 0)) && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                          {isAdmin
                            ? unreadQuestions > 99
                              ? "99+"
                              : unreadQuestions
                            : unreadMessages > 99
                            ? "99+"
                            : unreadMessages}
                        </span>
                      )}
                    </div>
                  </Link>

                  <Link
                    href="/profile/settings"
                    className={`font-sora-regular block px-4 py-2 rounded-md text-sm font-medium ${
                      pathname === "/profile/settings"
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Configuración
                  </Link>

                  {/* Sección específica para Admin */}
                  {isAdmin && (
                    <>
                      <hr className="my-3 border-gray-200" />
                      <div className="px-2 py-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Administración
                        </p>
                      </div>

                      <Link
                        href="/admin"
                        className="font-sora-regular block px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Panel Principal
                      </Link>

                      <Link
                        href="/admin/reviews"
                        className="font-sora-regular block px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Gestión de Reviews
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Widget de actividad reciente */}
              <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {isAdmin ? "Actividad Reciente" : "Estado"}
                  </h3>

                  {/* ✅ Mini botón de refresh */}
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    title="Actualizar"
                  >
                    <ArrowPathIcon
                      className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>

                <div className="space-y-3">
                  {isAdmin ? (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Preguntas pendientes
                        </span>
                        <span
                          className={`font-medium ${
                            unreadQuestions > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {unreadQuestions}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Respuestas nuevas</span>
                        <span
                          className={`font-medium ${
                            unreadMessages > 0
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {unreadMessages}
                        </span>
                      </div>
                    </>
                  )}

                  {lastFetch && (
                    <div className="text-xs text-gray-400 border-t pt-2">
                      Actualizado: {lastFetch}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
