// app/api/profile/orders/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function GET(request, { params }) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener el ID de la orden
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "ID de orden no proporcionado" },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Buscar la orden
    const order = await Order.findById(id);

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

    // Obtener detalles de pago si es un pago con MercadoPago
    let paymentDetails = null;
    if (order.paymentMethod === "mercadopago" && order.paymentId) {
      try {
        // Aquí puedes agregar lógica para obtener detalles de pago si tienes
        // una función específica para esto
        // Por ejemplo: const payments = await getPaymentDetails(order.paymentId);
      } catch (error) {
        console.error("Error al obtener detalles del pago:", error);
      }
    }

    // Devolver la orden
    return NextResponse.json({
      order: JSON.parse(JSON.stringify(order)),
      paymentDetails,
    });
  } catch (error) {
    console.error("Error al obtener orden:", error);
    return NextResponse.json(
      { message: "Error al obtener la orden: " + error.message },
      { status: 500 }
    );
  }
}
