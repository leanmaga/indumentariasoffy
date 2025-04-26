import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET - Obtener una orden por ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación
    if (!session) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const { id } = params;

    await connectDB();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { message: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si es admin o el usuario dueño de la orden
    if (
      session.user.role !== "admin" &&
      order.user.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { message: "No tienes permisos para ver este pedido" },
        { status: 403 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    return NextResponse.json(
      { message: "Error al obtener el pedido" },
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
    const { status } = await request.json();

    // Validar estado
    const validStatus = [
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
      { message: "Error al actualizar el pedido" },
      { status: 500 }
    );
  }
}
