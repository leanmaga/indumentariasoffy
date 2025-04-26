import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getPaymentStatus } from "@/lib/mercadopago";

export async function POST(request) {
  try {
    // Obtener los datos de la notificación
    const data = await request.json();
    console.log("Webhook de MercadoPago recibido:", data);

    // Verificar si es una notificación de pago
    if (
      data.action === "payment.created" ||
      data.action === "payment.updated"
    ) {
      // Obtener el ID del pago
      const paymentId = data.data.id;

      // Obtener detalles del pago desde MercadoPago
      const paymentInfo = await getPaymentStatus(paymentId);

      // Obtener el ID de la orden desde external_reference
      const externalReference = paymentInfo.external_reference;

      // Actualizar la orden en la base de datos
      await connectDB();

      const order = await Order.findById(externalReference);
      if (!order) {
        console.error(`Orden no encontrada: ${externalReference}`);
        return NextResponse.json(
          { message: "Orden no encontrada" },
          { status: 404 }
        );
      }

      // Actualizar el estado según el estado del pago
      if (paymentInfo.status === "approved") {
        order.status = "pagado";
      } else if (paymentInfo.status === "pending") {
        order.status = "pendiente";
      } else if (paymentInfo.status === "rejected") {
        order.status = "cancelado";
      }

      // Guardar el ID del pago
      order.paymentId = paymentId;
      await order.save();

      console.log(
        `Orden ${externalReference} actualizada a estado: ${order.status}`
      );
    }

    // MercadoPago espera un 200 OK como respuesta
    return NextResponse.json({ message: "Webhook procesado correctamente" });
  } catch (error) {
    console.error("Error al procesar webhook de MercadoPago:", error);
    // Es importante devolver 200 incluso en caso de error para evitar reenvíos
    return NextResponse.json(
      { message: `Error al procesar webhook: ${error.message}` },
      { status: 200 }
    );
  }
}

// MercadoPago también envía solicitudes OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
