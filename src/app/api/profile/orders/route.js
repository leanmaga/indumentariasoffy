// src/app/api/profile/orders/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

// GET - Obtener todas las órdenes del usuario autenticado
export async function GET(request) {
  try {
    // Obtener la sesión del usuario
    const session = await getServerSession(authOptions);

    // Verificar autenticación
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Conectar a la base de datos
    await connectDB();

    // Buscar al usuario por email
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Buscar todas las órdenes del usuario
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 }) // Ordenar por fecha de creación (más reciente primero)
      .lean(); // Para mejor rendimiento

    // Importante: devolver un array en lugar de un objeto con una propiedad orders
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error al obtener órdenes del usuario:", error);
    return NextResponse.json(
      { message: "Error al obtener órdenes del usuario" },
      { status: 500 }
    );
  }
}
