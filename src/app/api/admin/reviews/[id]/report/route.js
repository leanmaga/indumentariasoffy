// app/api/admin/reviews/[reviewId]/report/route.js - API PARA REPORTAR REVIEWS
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { authOptions } from "@/lib/auth";

// POST - Reportar una review (usuarios y admins)
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Debes iniciar sesión para reportar contenido",
        },
        { status: 401 }
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

    const { reason, details } = await request.json();

    if (!reason) {
      return NextResponse.json(
        { success: false, error: "Motivo del reporte es requerido" },
        { status: 400 }
      );
    }

    // Validar motivos permitidos
    const validReasons = [
      "spam",
      "inappropriate",
      "fake",
      "offensive",
      "irrelevant",
      "personal",
      "other",
    ];

    const reportReason = validReasons.includes(reason) ? reason : "other";

    await connectDB();

    const review = await Review.findById(reviewId);

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review no encontrada" },
        { status: 404 }
      );
    }

    // No permitir reportar su propia review
    if (review.user.toString() === session.user.id) {
      return NextResponse.json(
        { success: false, error: "No puedes reportar tu propia review" },
        { status: 400 }
      );
    }

    // Verificar si ya está reportada
    if (review.reported) {
      return NextResponse.json(
        { success: false, error: "Esta review ya ha sido reportada" },
        { status: 400 }
      );
    }

    // Reportar usando el método del modelo
    await review.report(reportReason, details, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Review reportada correctamente. Nuestro equipo la revisará.",
      review: {
        _id: review._id,
        reported: review.reported,
        reportedAt: review.reportedAt,
        reportReason: review.reportReason,
      },
    });
  } catch (error) {
    console.error("Error reporting review:", error);
    return NextResponse.json(
      { success: false, error: "Error al reportar review: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Quitar reporte (solo admins)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Solo administradores pueden quitar reportes",
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

    if (!review.reported) {
      return NextResponse.json(
        { success: false, error: "Esta review no está reportada" },
        { status: 400 }
      );
    }

    // Quitar reporte usando el método del modelo
    await review.unreport();

    return NextResponse.json({
      success: true,
      message: "Reporte removido correctamente",
      review: {
        _id: review._id,
        reported: review.reported,
      },
    });
  } catch (error) {
    console.error("Error removing report:", error);
    return NextResponse.json(
      { success: false, error: "Error al quitar reporte: " + error.message },
      { status: 500 }
    );
  }
}

// GET - Obtener información del reporte (solo admins)
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Solo administradores pueden ver reportes" },
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
      .populate("reportedBy", "name email")
      .populate("user", "name email")
      .populate("product", "title imageUrl");

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review no encontrada" },
        { status: 404 }
      );
    }

    const reportInfo = {
      reviewId: review._id,
      reported: review.reported,
      reportReason: review.reportReason,
      reportDetails: review.reportDetails,
      reportedAt: review.reportedAt,
      reportedBy: review.reportedBy,
      review: {
        comment: review.comment,
        rating: review.rating,
        type: review.type,
        user: review.user,
        product: review.product,
        createdAt: review.createdAt,
      },
      moderation: {
        moderated: review.moderated,
        moderatedAt: review.moderatedAt,
        moderatedBy: review.moderatedBy,
        moderationAction: review.moderationAction,
        visible: review.visible,
      },
    };

    return NextResponse.json({
      success: true,
      report: reportInfo,
    });
  } catch (error) {
    console.error("Error getting report info:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener información del reporte: " + error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Moderar review reportada (solo admins)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Solo administradores pueden moderar" },
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

    const { action, reason } = await request.json();

    // Validar acciones permitidas
    const validActions = ["approved", "hidden", "edited", "deleted"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: "Acción de moderación no válida" },
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

    // Moderar usando el método del modelo
    await review.moderate(action, session.user.id);

    // Si se aprueba, quitar el reporte
    if (action === "approved") {
      await review.unreport();
    }

    return NextResponse.json({
      success: true,
      message: `Review ${
        action === "approved"
          ? "aprobada"
          : action === "hidden"
          ? "ocultada"
          : "moderada"
      } correctamente`,
      review: {
        _id: review._id,
        moderationAction: review.moderationAction,
        visible: review.visible,
        reported: review.reported,
        moderated: review.moderated,
      },
    });
  } catch (error) {
    console.error("Error moderating review:", error);
    return NextResponse.json(
      { success: false, error: "Error al moderar review: " + error.message },
      { status: 500 }
    );
  }
}
