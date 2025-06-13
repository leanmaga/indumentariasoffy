"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { MagnifyingGlassIcon, EyeIcon } from "@heroicons/react/24/outline";
import { FaWhatsapp } from "react-icons/fa";

const OrderTable = ({ orders: initialOrders }) => {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUpdating, setIsUpdating] = useState(false);

  // Filtrar órdenes
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.shippingInfo?.name &&
        order.shippingInfo.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (order.shippingInfo?.email &&
        order.shippingInfo.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      order.status === statusFilter ||
      // Caso especial para filtrar todos los pedidos de WhatsApp
      (statusFilter === "whatsapp" && order.paymentMethod === "whatsapp");

    return matchesSearch && matchesStatus;
  });

  // Actualizar estado de la orden
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado del pedido");
      }

      // Actualizar estado local
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success("Estado del pedido actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
      toast.error("Error al actualizar el estado del pedido");
    } finally {
      setIsUpdating(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Abrir chat de WhatsApp
  const openWhatsAppChat = (order) => {
    // Extraer el número de teléfono del pedido (si existe) o usar un número predeterminado
    const phone = order.shippingInfo?.phone || "5491126907696"; // Reemplaza con tu número
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, "")}`; // Eliminar caracteres no numéricos
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div>
      {/* Filtros y búsqueda */}
      <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar pedidos..."
            className="pl-10 py-2 pr-4 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-4 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Todos los pedidos</option>
            <option value="whatsapp">Pedidos de WhatsApp</option>
            <option value="whatsapp_pendiente">WhatsApp - Pendiente</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="enviado">Enviado</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Tabla de pedidos */}
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
                Método
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className={`hover:bg-gray-50 ${
                    order.paymentMethod === "whatsapp" ? "bg-green-50" : ""
                  }`}
                >
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
                    {order.shippingInfo?.phone && (
                      <div className="text-sm text-gray-500">
                        {order.shippingInfo.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.paymentMethod === "whatsapp"
                          ? "bg-green-100 text-green-800"
                          : order.paymentMethod === "mercadopago"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.paymentMethod === "whatsapp" ? (
                        <span className="flex items-center">
                          <FaWhatsapp className="mr-1" /> WhatsApp
                        </span>
                      ) : order.paymentMethod === "mercadopago" ? (
                        "MercadoPago"
                      ) : (
                        order.paymentMethod
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "whatsapp_pendiente"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pagado"
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
                        {order.status === "whatsapp_pendiente"
                          ? "WhatsApp - Pendiente"
                          : order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                      </span>

                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order._id, e.target.value)
                        }
                        className="ml-2 py-1 pl-2 pr-8 text-xs border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isUpdating}
                      >
                        <option value="whatsapp_pendiente">
                          WhatsApp - Pendiente
                        </option>
                        <option value="pendiente">Pendiente</option>
                        <option value="pagado">Pagado</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {order.paymentMethod === "whatsapp" && (
                        <button
                          onClick={() => openWhatsAppChat(order)}
                          className="text-green-600 hover:text-green-900"
                          title="Contactar por WhatsApp"
                        >
                          <FaWhatsapp className="h-5 w-5" />
                        </button>
                      )}
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
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
                  No se encontraron pedidos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
