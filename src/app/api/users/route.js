// src/app/api/users/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

// GET - Obtener todos los usuarios (solo para admin)
export async function GET(request) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);

    // Verificar autenticación
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Verificar si es admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
    }

    // Conectar a la base de datos
    await connectDB();

    // Parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");
    const role = searchParams.get("role");

    // Construir la consulta
    let query = {};
    if (role) {
      query.role = role;
    }

    // Buscar usuarios con paginación
    const users = await User.find(query)
      .select("-password") // Excluir contraseñas
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Contar total para paginación
    const total = await User.countDocuments(query);

    // Retornar los usuarios
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { message: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
