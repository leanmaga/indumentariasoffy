import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getPaymentStatus } from "@/lib/mercadopago";

// POST - Webhook para recibir notificaciones de MercadoPago
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic") || searchParams.get("type");

    // Verificar si es una notificación de pago
    if (topic !== "payment") {
      return NextResponse.json({ message: "Not a payment notification" });
    }

    // Obtener datos de la notificación
    const body = await request.json();
    const paymentId = body.data?.id;

    if (!paymentId) {
      return NextResponse.json(
        { message: "No payment ID provided" },
        { status: 400 }
      );
    }

    // Obtener información completa del pago
    const paymentInfo = await getPaymentStatus(paymentId);

    // Verificar si el pago está aprobado
    if (paymentInfo.status !== "approved") {
      return NextResponse.json({ message: "Payment not approved" });
    }

    await connectDB();

    // Buscar la orden relacionada con este pago
    const orderId = paymentInfo.external_reference;
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Actualizar el estado de la orden
    order.status = "pagado";
    order.paymentId = paymentId;
    await order.save();

    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    );
  }
}
