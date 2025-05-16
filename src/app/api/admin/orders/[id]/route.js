import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getPaymentsByExternalReference } from "@/lib/mercadopago";

// GET - Obtener detalles de una orden específica (solo admin)
export async function GET(request, { params }) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);

    // Verificar si es administrador
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "ID de orden no proporcionado" },
        { status: 400 }
      );
    }

    await connectDB();

    // Buscar la orden con información del usuario
    const order = await Order.findById(id).populate("user", "name email phone");

    if (!order) {
      return NextResponse.json(
        { message: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Si es un pago con MercadoPago, obtener detalles adicionales
    let paymentDetails = null;
    if (order.paymentMethod === "mercadopago" && order.paymentId) {
      try {
        const payments = await getPaymentsByExternalReference(
          order._id.toString()
        );
        if (payments && payments.length > 0) {
          paymentDetails = payments[0];
        }
      } catch (error) {
        console.error("Error al obtener detalles del pago:", error);
      }
    }

    // Retornar la orden con detalles de pago si existen
    if (paymentDetails) {
      return NextResponse.json({
        order,
        paymentDetails,
      });
    }

    // Si no hay detalles de pago, retornar solo la orden
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    return NextResponse.json(
      { message: "Error al obtener el pedido: " + error.message },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar el estado de una orden (solo admin)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación y permisos
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "ID de orden no proporcionado" },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    // Validar estado (incluye whatsapp_pendiente)
    const validStatus = [
      "whatsapp_pendiente", // Estado para pedidos de WhatsApp
      "pendiente",
      "pagado",
      "enviado",
      "entregado",
      "cancelado",
    ];

    if (!validStatus.includes(status)) {
      return NextResponse.json(
        { message: "Estado no válido" },
        { status: 400 }
      );
    }

    await connectDB();

    // Buscar y actualizar la orden
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { message: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    order.status = status;
    await order.save();

    return NextResponse.json({
      message: "Estado del pedido actualizado correctamente",
      order,
    });
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    return NextResponse.json(
      { message: "Error al actualizar el pedido: " + error.message },
      { status: 500 }
    );
  }
}
