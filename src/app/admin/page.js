"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PopularProducts from "@/components/admin/PopularProducts";
import StatsCards from "@/components/admin/StatsCards";

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // Mostrar pantalla de carga mientras se cargan los datos
  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  const { products, orders, users, totalSales, pendingOrders, recentOrders } =
    dashboardData;

  return (
    <div className="border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-600 transition"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Información del administrador */}
      <div className="bg-white p-4 border border-gray-200 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-2">
          Admin: {session.user.name}
        </h2>
        <p className="text-gray-600">{session.user.email}</p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <StatsCards
        productsCount={products.length || 0}
        ordersCount={orders.length || 0}
        usersCount={users.length || 0}
        totalSales={totalSales}
        pendingOrders={pendingOrders}
      />

      {/* Órdenes Recientes */}
      <div className="bg-white border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pedidos Recientes</h2>
          <Link
            href="/admin/orders"
            className="text-black hover:underline text-sm font-medium"
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
                            ? "bg-black bg-opacity-10 text-white"
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
      <PopularProducts products={products} />
    </div>
  );
}
