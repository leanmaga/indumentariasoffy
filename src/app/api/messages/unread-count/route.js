// src/app/api/messages/unread-count/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    await connectDB();

    if (session.user.role === "admin") {
      // Para admin: contar preguntas sin responder
      const pendingQuestions = await Review.countDocuments({
        type: "question",
        response: { $in: [null, "", undefined] },
      });

      return NextResponse.json({
        success: true,
        pendingQuestions,
        totalQuestions: await Review.countDocuments({ type: "question" }),
      });
    } else {
      // Para usuarios: contar respuestas no leídas
      const userQuestions = await Review.find({
        user: session.user.id,
        type: "question",
        response: { $ne: "" },
      });

      // Por simplicidad, consideramos "no leída" si la respuesta es reciente
      const unreadResponses = userQuestions.filter(
        (q) =>
          q.responseDate &&
          new Date(q.responseDate) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 días
      ).length;

      return NextResponse.json({
        success: true,
        unreadResponses,
        totalQuestions: userQuestions.length,
      });
    }
  } catch (error) {
    console.error("Error getting unread count:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener conteo" },
      { status: 500 }
    );
  }
}
