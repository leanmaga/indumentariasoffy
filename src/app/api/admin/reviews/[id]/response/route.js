// app/api/admin/reviews/[reviewId]/response/route.js - API PARA RESPONDER PREGUNTAS
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";
import Product from "@/models/Product";
import { authOptions } from "@/lib/auth";

// POST - Responder a una pregunta (solo admins)
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Solo administradores pueden responder preguntas",
        },
        { status: 403 }
      );
    }

    const awaitedParams = await params;
    const reviewId = awaitedParams.reviewId;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "ID de review requerido" },
        { status: 400 }
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

    if (response.trim().length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "La respuesta no puede exceder 1000 caracteres",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const review = await Review.findById(reviewId)
      .populate("user", "name email")
      .populate("product", "title imageUrl");

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

    if (review.response && review.response.trim()) {
      return NextResponse.json(
        { success: false, error: "Esta pregunta ya ha sido respondida" },
        { status: 400 }
      );
    }

    // Actualizar la pregunta con la respuesta
    review.response = response.trim();
    review.responseDate = new Date();
    await review.save();

    return NextResponse.json({
      success: true,
      message: "Respuesta enviada correctamente",
      review: {
        _id: review._id,
        response: review.response,
        responseDate: review.responseDate,
        user: review.user,
        product: review.product,
        comment: review.comment,
      },
    });
  } catch (error) {
    console.error("Error responding to question:", error);
    return NextResponse.json(
      { success: false, error: "Error al enviar respuesta: " + error.message },
      { status: 500 }
    );
  }
}

// PUT - Editar una respuesta existente (solo admins)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Solo administradores pueden editar respuestas",
        },
        { status: 403 }
      );
    }

    const awaitedParams = await params;
    const reviewId = awaitedParams.reviewId;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "ID de review requerido" },
        { status: 400 }
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

    if (response.trim().length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "La respuesta no puede exceder 1000 caracteres",
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
        {
          success: false,
          error: "Solo se pueden editar respuestas de preguntas",
        },
        { status: 400 }
      );
    }

    if (!review.response || !review.response.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Esta pregunta no tiene respuesta para editar",
        },
        { status: 400 }
      );
    }

    // Actualizar la respuesta
    const previousResponse = review.response;
    review.response = response.trim();
    review.responseDate = new Date(); // Actualizar fecha de respuesta
    await review.save();

    return NextResponse.json({
      success: true,
      message: "Respuesta actualizada correctamente",
      review: {
        _id: review._id,
        response: review.response,
        responseDate: review.responseDate,
        previousResponse, // Para auditoría
      },
    });
  } catch (error) {
    console.error("Error editing response:", error);
    return NextResponse.json(
      { success: false, error: "Error al editar respuesta: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una respuesta (solo admins)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Solo administradores pueden eliminar respuestas",
        },
        { status: 403 }
      );
    }

    const awaitedParams = await params;
    const reviewId = awaitedParams.reviewId;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "ID de review requerido" },
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
        {
          success: false,
          error: "Solo se pueden eliminar respuestas de preguntas",
        },
        { status: 400 }
      );
    }

    if (!review.response || !review.response.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Esta pregunta no tiene respuesta para eliminar",
        },
        { status: 400 }
      );
    }

    // Eliminar la respuesta
    review.response = "";
    review.responseDate = undefined;
    await review.save();

    return NextResponse.json({
      success: true,
      message: "Respuesta eliminada correctamente",
      review: {
        _id: review._id,
        response: review.response,
        responseDate: review.responseDate,
      },
    });
  } catch (error) {
    console.error("Error deleting response:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar respuesta: " + error.message,
      },
      { status: 500 }
    );
  }
}

// GET - Obtener información de la respuesta (para edición)
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Solo administradores pueden ver respuestas" },
        { status: 403 }
      );
    }

    const awaitedParams = await params;
    const reviewId = awaitedParams.reviewId;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "ID de review requerido" },
        { status: 400 }
      );
    }

    await connectDB();

    const review = await Review.findById(reviewId)
      .populate("user", "name email")
      .populate("product", "title imageUrl");

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review no encontrada" },
        { status: 404 }
      );
    }

    if (review.type !== "question") {
      return NextResponse.json(
        { success: false, error: "Solo las preguntas pueden tener respuestas" },
        { status: 400 }
      );
    }

    const responseInfo = {
      reviewId: review._id,
      question: review.comment,
      response: review.response || "",
      responseDate: review.responseDate,
      hasResponse: Boolean(review.response && review.response.trim()),
      user: review.user,
      product: review.product,
      createdAt: review.createdAt,
      verified: review.verified,
    };

    return NextResponse.json({
      success: true,
      responseInfo,
    });
  } catch (error) {
    console.error("Error getting response info:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener información de respuesta: " + error.message,
      },
      { status: 500 }
    );
  }
}
