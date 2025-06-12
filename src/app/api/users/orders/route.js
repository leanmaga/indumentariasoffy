// src/app/api/users/orders/route.js - ENDPOINT FALTANTE
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

// GET - Obtener órdenes del usuario autenticado
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

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const userOnly = searchParams.get("userOnly") === "true";
    const limit = parseInt(searchParams.get("limit")) || 10;
    const page = parseInt(searchParams.get("page")) || 1;

    // Buscar al usuario por email
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    let query = {};

    // Si userOnly es true o no es admin, mostrar solo las órdenes del usuario
    if (userOnly || session.user.role !== "admin") {
      query.user = user._id;
    }

    // Buscar órdenes con paginación
    const orders = await Order.find(query)
      .sort({ createdAt: -1 }) // Más recientes primero
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // Para mejor rendimiento

    // Contar total para paginación
    const total = await Order.countDocuments(query);

    // Devolver respuesta
    return NextResponse.json({
      success: true,
      orders: orders,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener órdenes del usuario:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener órdenes del usuario",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
