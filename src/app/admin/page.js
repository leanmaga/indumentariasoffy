"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CubeIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState({
    products: [],
    orders: [],
    users: [],
    totalSales: 0,
    pendingOrders: 0,
    recentOrders: [],
  });

  const [isDataLoading, setIsDataLoading] = useState(true);

  // Verificar autenticación y rol de administrador
  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && session?.user?.role !== "admin")
    ) {
      router.push("/auth/login");
    }
  }, [status, session, router]);

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status !== "authenticated" || session?.user?.role !== "admin") {
        return;
      }

      try {
        setIsDataLoading(true);

        // Cargar productos con manejo de errores
        let productsData = [];
        try {
          const productsRes = await fetch("/api/products");
          if (productsRes.ok) {
            const data = await productsRes.json();
            productsData = data.products || [];
          } else {
            console.error("Error al cargar productos:", productsRes.status);
          }
        } catch (error) {
          console.error("Error al cargar productos:", error);
        }

        // Cargar órdenes con manejo de errores
        let ordersData = [];
        try {
          const ordersRes = await fetch("/api/orders");
          if (ordersRes.ok) {
            ordersData = await ordersRes.json();
            // Si no es un array, manejar el caso
            if (!Array.isArray(ordersData)) {
              console.error("Respuesta de órdenes no es un array:", ordersData);
              ordersData = [];
            }
          } else {
            console.error("Error al cargar órdenes:", ordersRes.status);
          }
        } catch (error) {
          console.error("Error al cargar órdenes:", error);
        }

        // Cargar usuarios con manejo de errores
        let usersData = [];
        try {
          const usersRes = await fetch("/api/users");
          if (usersRes.ok) {
            usersData = await usersRes.json();
            // Si no es un array, manejar el caso
            if (!Array.isArray(usersData)) {
              console.error("Respuesta de usuarios no es un array:", usersData);
              usersData = [];
            }
          } else {
            console.error("Error al cargar usuarios:", usersRes.status);
          }
        } catch (error) {
          console.error("Error al cargar usuarios:", error);
        }

        // Calcular estadísticas
        const totalSales = Array.isArray(ordersData)
          ? ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
          : 0;

        const pendingOrders = Array.isArray(ordersData)
          ? ordersData.filter((order) => order.status === "pendiente").length
          : 0;

        // Órdenes recientes (las últimas 5)
        const recentOrders = Array.isArray(ordersData)
          ? ordersData.slice(0, 5)
          : [];

        setDashboardData({
          products: productsData,
          orders: ordersData,
          users: usersData,
          totalSales,
          pendingOrders,
          recentOrders,
        });
      } catch (error) {
        console.error("Error general al cargar datos del dashboard:", error);
        toast.error("Error al cargar datos del dashboard");
      } finally {
        setIsDataLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchDashboardData();
    }
  }, [status, session]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success("Sesión cerrada correctamente");
    router.push("/auth/login");
  };

  // Mostrar pantalla de carga mientras se verifican permisos
  if (
    status === "loading" ||
    status === "unauthenticated" ||
    (status === "authenticated" && session?.user?.role !== "admin")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Mostrar pantalla de carga mientras se cargan los datos
  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Desestructurar datos para mejor legibilidad
  const { products, orders, users, totalSales, pendingOrders, recentOrders } =
    dashboardData;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Información del administrador */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-2">
          Admin: {session.user.name}
        </h2>
        <p className="text-gray-500">{session.user.email}</p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <CubeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">Productos</h2>
              <p className="text-2xl font-semibold">{products.length || 0}</p>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="text-blue-600 hover:text-blue-800 text-sm mt-4 inline-block"
          >
            Ver detalles →
          </Link>
        </div>

        <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <ClipboardDocumentListIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">Pedidos</h2>
              <p className="text-2xl font-semibold">{orders.length || 0}</p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="text-green-600 hover:text-green-800 text-sm mt-4 inline-block"
          >
            Ver detalles →
          </Link>
        </div>

        <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">Usuarios</h2>
              <p className="text-2xl font-semibold">{users.length || 0}</p>
            </div>
          </div>
          <Link
            href="/admin/users"
            className="text-purple-600 hover:text-purple-800 text-sm mt-4 inline-block"
          >
            Ver detalles →
          </Link>
        </div>

        <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">Ventas Totales</h2>
              <p className="text-2xl font-semibold">${totalSales.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-yellow-600 text-sm mt-4">
            {pendingOrders} pedidos pendientes
          </div>
        </div>
      </div>

      {/* Órdenes Recientes */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pedidos Recientes</h2>
          <Link
            href="/admin/orders"
            className="text-indigo-600 hover:text-indigo-800 text-sm"
          >
            Ver todos
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID Pedido
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cliente
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.shippingInfo?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.shippingInfo?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.totalAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "pagado"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pendiente"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "enviado"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "entregado"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status
                          ? order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)
                          : "N/A"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No hay pedidos recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Productos Populares */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Productos Populares</h2>
          <Link
            href="/admin/products"
            className="text-indigo-600 hover:text-indigo-800 text-sm"
          >
            Ver todos
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products && products.length > 0 ? (
            products.slice(0, 3).map((product) => (
              <div
                key={product._id}
                className="border rounded-lg overflow-hidden flex"
              >
                <div className="w-24 h-24 bg-gray-200 relative flex-shrink-0">
                  {product.imageUrl && (
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      sizes="100vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-4 flex-1">
                  <h3 className="font-medium text-gray-900 mb-1 truncate">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    $
                    {product.salePrice !== undefined
                      ? product.salePrice.toFixed(2)
                      : product.price !== undefined
                      ? product.price.toFixed(2)
                      : "0.00"}
                    {product.promoPrice > 0 && (
                      <span className="ml-2 text-red-500">
                        Promo: ${product.promoPrice.toFixed(2)}
                      </span>
                    )}
                  </p>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {product.category
                      ? product.category.charAt(0).toUpperCase() +
                        product.category.slice(1)
                      : "Sin categoría"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-4 text-gray-500">
              No hay productos disponibles
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
