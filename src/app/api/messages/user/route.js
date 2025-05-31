// ================================================================
// app/api/messages/user/route.js - Mensajes del usuario
// ================================================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
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

    // Obtener todas las preguntas del usuario con información del producto
    const userQuestions = await Review.find({
      user: session.user.id,
      type: "question",
    })
      .populate("product", "title imageUrl")
      .sort({ createdAt: -1 });

    const formattedQuestions = userQuestions.map((question) => ({
      _id: question._id,
      comment: question.comment,
      createdAt: question.createdAt,
      response: question.response,
      responseDate: question.responseDate,
      helpful: question.helpful,
      product: {
        _id: question.product._id,
        title: question.product.title,
        imageUrl: question.product.imageUrl,
      },
      status: question.response ? "answered" : "pending",
    }));

    return NextResponse.json({
      success: true,
      questions: formattedQuestions,
      stats: {
        total: formattedQuestions.length,
        pending: formattedQuestions.filter((q) => q.status === "pending")
          .length,
        answered: formattedQuestions.filter((q) => q.status === "answered")
          .length,
      },
    });
  } catch (error) {
    console.error("Error getting user messages:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener mensajes" },
      { status: 500 }
    );
  }
}
