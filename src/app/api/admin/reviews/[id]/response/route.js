// app/api/admin/reviews/[reviewId]/response/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { authOptions } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    const { reviewId } = await params;
    const session = await getServerSession(authOptions);

    // Verificar que sea administrador
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    const { response } = await request.json();

    if (!response || response.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "La respuesta debe tener al menos 10 caracteres",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const review = await Review.findById(reviewId);

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review no encontrada" },
        { status: 404 }
      );
    }

    if (review.type !== "question") {
      return NextResponse.json(
        { success: false, error: "Solo se pueden responder preguntas" },
        { status: 400 }
      );
    }

    // Actualizar la review con la respuesta
    review.response = response.trim();
    review.responseDate = new Date();
    await review.save();

    return NextResponse.json({
      success: true,
      message: "Respuesta enviada correctamente",
    });
  } catch (error) {
    console.error("Error sending response:", error);
    return NextResponse.json(
      { success: false, error: "Error al enviar respuesta" },
      { status: 500 }
    );
  }
}
