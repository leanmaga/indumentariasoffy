import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getOrderById } from "@/lib/data";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import OrderStatusUpdate from "@/components/admin/OrderStatusUpdate";

export async function generateMetadata({ params }) {
  const order = await getOrderById(params.id);

  if (!order) {
    return {
      title: "Pedido no encontrado | TiendaOnline",
    };
  }

  return {
    title: `Pedido #${order._id.substring(0, 8)} | TiendaOnline`,
  };
}

export default async function OrderDetailPage({ params }) {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Volver a todos los pedidos
      </Link>

      <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Pedido #{order._id.substring(0, 8)}
          </h1>
          <p className="text-gray-500">
            Realizado el {formatDate(order.createdAt)}
          </p>
        </div>

        <OrderStatusUpdate order={order} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos del pedido */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Productos</h2>
            </div>

            <div className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <div key={item._id} className="flex p-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      sizes="100px"
                      className="object-cover object-center"
                    />
                  </div>

                  <div className="ml-6 flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <h3 className="text-base font-medium text-gray-900">
                        <Link
                          href={`/products/${item.product}`}
                          className="hover:text-indigo-600"
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <p className="ml-4 text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Cantidad: {item.quantity}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Precio unitario: ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen de precios */}
            <div className="border-t border-gray-200 px-6 py-4 space-y-2">
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="text-sm font-medium text-gray-900">
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Envío</p>
                <p className="text-sm font-medium text-gray-900">
                  Por coordinar
                </p>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <p className="text-base font-medium text-gray-900">Total</p>
                <p className="text-base font-medium text-gray-900">
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del cliente y envío */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Información del Cliente</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                <p>{order.shippingInfo.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p>{order.shippingInfo.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                <p>{order.shippingInfo.phone}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Dirección de Envío</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
                <p>{order.shippingInfo.address}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Ciudad</h3>
                <p>{order.shippingInfo.city}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Código Postal
                </h3>
                <p>{order.shippingInfo.postalCode}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Información de Pago</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Método de Pago
                </h3>
                <p>
                  {order.paymentMethod === "mercadopago"
                    ? "MercadoPago"
                    : order.paymentMethod === "credit_card"
                    ? "Tarjeta de Crédito"
                    : order.paymentMethod === "debit_card"
                    ? "Tarjeta de Débito"
                    : order.paymentMethod}
                </p>
              </div>
              {order.paymentId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    ID de Pago
                  </h3>
                  <p>{order.paymentId}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                <p
                  className={`${
                    order.status === "pagado"
                      ? "text-green-600"
                      : order.status === "pendiente"
                      ? "text-yellow-600"
                      : order.status === "enviado"
                      ? "text-blue-600"
                      : order.status === "entregado"
                      ? "text-indigo-600"
                      : "text-red-600"
                  } font-medium`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
