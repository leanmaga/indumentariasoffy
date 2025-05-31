// app/api/users/messages/route.js - MENSAJES DEL USUARIO
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Obtener todas las preguntas del usuario
    const messages = await Review.find({
      user: session.user.id,
      type: "question",
    })
      .populate("product", "title imageUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({
      user: session.user.id,
      type: "question",
    });

    // Estadísticas del usuario
    const stats = {
      total,
      pending: await Review.countDocuments({
        user: session.user.id,
        type: "question",
        $or: [
          { response: { $exists: false } },
          { response: "" },
          { response: null },
        ],
      }),
      answered: await Review.countDocuments({
        user: session.user.id,
        type: "question",
        response: { $exists: true, $ne: "" },
      }),
    };

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        totalItems: total,
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching user messages:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener mensajes" },
      { status: 500 }
    );
  }
}
