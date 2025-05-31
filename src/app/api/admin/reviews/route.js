// app/api/admin/reviews/route.js
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

    await connectDB();

    // Obtener todas las reviews con información de usuario y producto
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "title imageUrl")
      .sort({ createdAt: -1 });

    // Calcular estadísticas
    const stats = {
      total: reviews.length,
      questions: reviews.filter((r) => r.type === "question").length,
      ratings: reviews.filter((r) => r.type === "rating").length,
      pendingQuestions: reviews.filter(
        (r) => r.type === "question" && !r.response
      ).length,
      averageRating: 0,
      reportedCount: reviews.filter((r) => r.reported).length,
    };

    // Calcular rating promedio
    const ratingReviews = reviews.filter((r) => r.type === "rating");
    if (ratingReviews.length > 0) {
      const totalRating = ratingReviews.reduce((sum, r) => sum + r.rating, 0);
      stats.averageRating = totalRating / ratingReviews.length;
    }

    return NextResponse.json({
      success: true,
      reviews,
      stats,
    });
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener reviews" },
      { status: 500 }
    );
  }
}

// app/api/admin/reviews/[reviewId]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { authOptions } from "@/lib/auth";

export async function DELETE(request, { params }) {
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

    await connectDB();

    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review eliminada correctamente",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar review" },
      { status: 500 }
    );
  }
}

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
