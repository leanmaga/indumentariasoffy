import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function GET(request) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Conectar a la base de datos
    await connectDB();

    // Obtener las órdenes del usuario actual
    const orders = await Order.find({ user: session.user.id })
      .sort({ createdAt: -1 }) // Ordenar por fecha, más reciente primero
      .lean(); // Convertir a objeto plano para mejor rendimiento

    return NextResponse.json({
      orders,
    });
  } catch (error) {
    console.error("Error al obtener las órdenes del usuario:", error);
    return NextResponse.json(
      { message: `Error al obtener las órdenes: ${error.message}` },
      { status: 500 }
    );
  }
}
