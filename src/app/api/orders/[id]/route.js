import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { getPaymentsByExternalReference } from "@/lib/mercadopago";

// GET para obtener los detalles de una orden específica
export async function GET(request, { params }) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const orderId = params.id;

    // Conectar a la base de datos
    await dbConnect();

    // Buscar la orden
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la orden pertenezca al usuario (a menos que sea admin)
    if (
      session.user.role !== "admin" &&
      order.user.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { message: "No autorizado para ver esta orden" },
        { status: 403 }
      );
    }

    // Si la orden tiene MercadoPago como método de pago, obtener detalles adicionales
    let paymentDetails = null;
    if (order.paymentMethod === "mercadopago" && order.paymentId) {
      // Obtener detalles del pago directamente por ID
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

    return NextResponse.json({
      order,
      paymentDetails,
    });
  } catch (error) {
    console.error("Error al obtener la orden:", error);
    return NextResponse.json(
      { message: `Error al obtener la orden: ${error.message}` },
      { status: 500 }
    );
  }
}

// PATCH para actualizar el estado de una orden (solo para admins)
export async function PATCH(request, { params }) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const orderId = params.id;
    const data = await request.json();

    // Conectar a la base de datos
    await dbConnect();

    // Buscar la orden
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar el estado de la orden
    if (data.status) {
      order.status = data.status;
    }

    await order.save();

    return NextResponse.json({
      message: "Orden actualizada correctamente",
      order,
    });
  } catch (error) {
    console.error("Error al actualizar la orden:", error);
    return NextResponse.json(
      { message: `Error al actualizar la orden: ${error.message}` },
      { status: 500 }
    );
  }
}
