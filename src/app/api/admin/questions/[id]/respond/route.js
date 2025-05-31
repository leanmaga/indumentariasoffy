// ================================================================
// app/api/admin/questions/[questionId]/respond/route.js
// ================================================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";
import Product from "@/models/Product";
import { authOptions } from "@/lib/auth";
import { sendQuestionAnsweredEmail } from "@/lib/review-emails";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 403 }
      );
    }

    const { questionId } = await params;
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

    const question = await Review.findById(questionId)
      .populate("user", "name email")
      .populate("product", "title imageUrl");

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Pregunta no encontrada" },
        { status: 404 }
      );
    }

    if (question.type !== "question") {
      return NextResponse.json(
        { success: false, error: "Solo se pueden responder preguntas" },
        { status: 400 }
      );
    }

    // Actualizar la pregunta con la respuesta
    question.response = response.trim();
    question.responseDate = new Date();
    await question.save();

    // Enviar email de notificación al usuario (opcional)
    try {
      await sendQuestionAnsweredEmail(
        question,
        question.product,
        question.user
      );
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // No fallar la operación por error de email
    }

    return NextResponse.json({
      success: true,
      message: "Respuesta enviada con éxito",
      question: {
        _id: question._id,
        response: question.response,
        responseDate: question.responseDate,
      },
    });
  } catch (error) {
    console.error("Error responding to question:", error);
    return NextResponse.json(
      { success: false, error: "Error al enviar respuesta" },
      { status: 500 }
    );
  }
}
