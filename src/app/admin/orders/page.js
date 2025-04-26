import { getAllOrders } from "@/lib/data";
import OrderTable from "@/components/admin/OrderTable";

export const metadata = {
  title: "Gestión de Pedidos | TiendaOnline",
  description: "Administra los pedidos de tu tienda en línea.",
};

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Gestión de Pedidos</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <OrderTable orders={orders} />
      </div>
    </div>
  );
}
