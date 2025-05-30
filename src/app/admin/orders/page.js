import { getAllOrders } from "@/lib/data";
import OrderTable from "@/components/admin/OrderTable";
import OrderCleanupButton from "@/components/admin/OrderCleanupButton";

export const metadata = {
  title: "Gestión de Pedidos | TiendaOnline",
  description: "Administra los pedidos de tu tienda en línea.",
};

export default async function AdminOrdersPage() {
  const ordersResponse = await getAllOrders();

  // Verificar si la respuesta es un array o un objeto con propiedad orders
  const orders = Array.isArray(ordersResponse)
    ? ordersResponse
    : ordersResponse.orders || [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Gestión de Pedidos</h1>
      <OrderCleanupButton />
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <OrderTable orders={orders} />
      </div>
    </div>
  );
}
