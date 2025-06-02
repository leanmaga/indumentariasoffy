// src/app/api/admin/questions/[id]/respond/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import { sendQuestionAnsweredEmail } from "@/lib/review-emails";

export async function POST(request, { params }) {
  try {
    const { id: questionId } = await params;

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

    // Buscar la pregunta
    const question = await Review.findById(questionId)
      .populate("user", "name email")
      .populate("product", "title imageUrl salePrice");

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Pregunta no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que sea una pregunta (no una calificación)
    if (question.type !== "question") {
      return NextResponse.json(
        { success: false, error: "Solo se pueden responder preguntas" },
        { status: 400 }
      );
    }

    // Verificar que no esté ya respondida
    if (question.response && question.response.trim() !== "") {
      return NextResponse.json(
        { success: false, error: "Esta pregunta ya fue respondida" },
        { status: 400 }
      );
    }

    // Actualizar la pregunta con la respuesta
    question.response = response.trim();
    question.responseDate = new Date();
    await question.save();

    // Enviar email al usuario que hizo la pregunta
    try {
      const emailResult = await sendQuestionAnsweredEmail(
        question,
        question.product,
        question.user
      );
    } catch (emailError) {
      console.error("❌ Error enviando email:", emailError);
      // No fallar la respuesta por error de email
    }

    return NextResponse.json({
      success: true,
      message: "Respuesta enviada exitosamente",
      question: {
        _id: question._id,
        response: question.response,
        responseDate: question.responseDate,
      },
    });
  } catch (error) {
    console.error("❌ Error responding to question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al responder la pregunta: " + error.message,
      },
      { status: 500 }
    );
  }
}
