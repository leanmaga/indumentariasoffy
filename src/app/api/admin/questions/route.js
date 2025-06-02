// src/app/api/admin/questions/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar que sea administrador
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    await connectDB();

    // Construir query para filtrar preguntas
    let query = { type: "question" };

    // Aplicar filtros de estado
    if (status === "pending") {
      query.$or = [
        { response: { $exists: false } },
        { response: "" },
        { response: null },
      ];
    } else if (status === "answered") {
      query.response = { $exists: true, $ne: "" };
    }

    // Obtener preguntas con paginación
    const questions = await Review.find(query)
      .populate("user", "name email phone")
      .populate("product", "title imageUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Contar total para paginación
    const total = await Review.countDocuments(query);

    // Calcular estadísticas
    const stats = {
      total: await Review.countDocuments({ type: "question" }),
      pending: await Review.countDocuments({
        type: "question",
        $or: [
          { response: { $exists: false } },
          { response: "" },
          { response: null },
        ],
      }),
      answered: await Review.countDocuments({
        type: "question",
        response: { $exists: true, $ne: "" },
      }),
    };

    return NextResponse.json({
      success: true,
      questions,
      stats,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching admin questions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener preguntas: " + error.message,
      },
      { status: 500 }
    );
  }
}
