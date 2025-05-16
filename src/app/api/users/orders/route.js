// app/api/users/orders/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

// GET - Obtener órdenes del usuario
export async function GET(request) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Conectar a la base de datos
    await connectDB();

    // Obtener el usuario
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status");

    // Construir la consulta
    let query = { user: user._id };
    if (status) {
      query.status = status;
    }

    // Obtener las órdenes
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Contar el total para paginación
    const total = await Order.countDocuments(query);

    // Retornar las órdenes
    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return NextResponse.json(
      { message: "Error al obtener órdenes" },
      { status: 500 }
    );
  }
}
