// app/api/admin/reviews/[reviewId]/route.js - API PARA GESTIÓN INDIVIDUAL DE REVIEWS
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

// GET - Obtener una review específica
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    // AWAIT params antes de usarlo
    const resolvedParams = await params;
    const reviewId = resolvedParams.reviewId;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "ID de review requerido" },
        { status: 400 }
      );
    }

    await connectDB();

    const review = await Review.findById(reviewId)
      .populate("user", "name email phone")
      .populate("product", "title imageUrl category");

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener review: " + error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una review (admin)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    // AWAIT params antes de usarlo
    const resolvedParams = await params;
    const reviewId = resolvedParams.reviewId;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "ID de review requerido" },
        { status: 400 }
      );
    }

    const { comment, rating, verified, reported, response, visible } =
      await request.json();

    await connectDB();

    const review = await Review.findById(reviewId);

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar campos permitidos
    const updateData = {};

    if (comment !== undefined) updateData.comment = comment.trim();
    if (rating !== undefined && review.type === "rating") {
      updateData.rating = parseInt(rating);
    }
    if (verified !== undefined) updateData.verified = Boolean(verified);
    if (reported !== undefined) {
      updateData.reported = Boolean(reported);
      if (reported) {
        updateData.reportedAt = new Date();
        updateData.reportedBy = session.user.id;
      } else {
        updateData.$unset = {
          reportedAt: "",
          reportedBy: "",
          reportReason: "",
        };
      }
    }
    if (response !== undefined && review.type === "question") {
      updateData.response = response.trim();
      if (response.trim()) {
        updateData.responseDate = new Date();
      }
    }
    if (visible !== undefined) updateData.visible = Boolean(visible);

    const updatedReview = await Review.findByIdAndUpdate(reviewId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email")
      .populate("product", "title imageUrl");

    // Si se cambió el rating, actualizar estadísticas del producto
    if (rating !== undefined && review.type === "rating") {
      await updateProductRatingStats(review.product);
    }

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: "Review actualizada correctamente",
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar review: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una review
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    // AWAIT params antes de usarlo
    const resolvedParams = await params;
    const reviewId = resolvedParams.reviewId;

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

    const productId = review.product;
    const reviewType = review.type;

    // Eliminar la review
    await Review.findByIdAndDelete(reviewId);

    // Si era una calificación, actualizar estadísticas del producto
    if (reviewType === "rating") {
      await updateProductRatingStats(productId);
    }

    return NextResponse.json({
      success: true,
      message: "Review eliminada correctamente",
      deletedId: reviewId,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar review: " + error.message },
      { status: 500 }
    );
  }
}

// Función auxiliar para actualizar estadísticas de rating de un producto
async function updateProductRatingStats(productId) {
  try {
    // Usar mongoose.Types.ObjectId correctamente
    const objectId = new mongoose.Types.ObjectId(productId);

    const stats = await Review.aggregate([
      {
        $match: {
          product: objectId,
          type: "rating",
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      const newRating = Math.round(stats[0].avgRating * 10) / 10;
      const newCount = stats[0].numReviews;

      await Product.findByIdAndUpdate(productId, {
        rating: newRating,
        numReviews: newCount,
      });
    } else {
      // Si no hay más reviews de rating, resetear a 0
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0,
      });
    }
  } catch (error) {
    console.error(`❌ Error updating product ${productId} stats:`, error);
    throw error;
  }
}

// PATCH - Para acciones específicas (reportar, verificar, etc.)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    // AWAIT params antes de usarlo
    const resolvedParams = await params;
    const reviewId = resolvedParams.reviewId;
    const { action, data } = await request.json();

    if (!reviewId || !action) {
      return NextResponse.json(
        { success: false, error: "ID de review y acción son requeridos" },
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

    let updateData = {};
    let message = "";

    switch (action) {
      case "toggle_verified":
        updateData.verified = !review.verified;
        message = `Review ${
          updateData.verified
            ? "marcada como verificada"
            : "desmarcada como verificada"
        }`;
        break;

      case "toggle_reported":
        updateData.reported = !review.reported;
        if (updateData.reported) {
          updateData.reportedAt = new Date();
          updateData.reportedBy = session.user.id;
          updateData.reportReason = data?.reason || "Marcado por administrador";
        } else {
          updateData.$unset = {
            reportedAt: "",
            reportedBy: "",
            reportReason: "",
          };
        }
        message = `Review ${
          updateData.reported
            ? "marcada como reportada"
            : "desmarcada como reportada"
        }`;
        break;

      case "respond":
        if (review.type !== "question") {
          return NextResponse.json(
            { success: false, error: "Solo se puede responder a preguntas" },
            { status: 400 }
          );
        }
        if (!data?.response || data.response.trim().length < 10) {
          return NextResponse.json(
            {
              success: false,
              error: "La respuesta debe tener al menos 10 caracteres",
            },
            { status: 400 }
          );
        }
        updateData.response = data.response.trim();
        updateData.responseDate = new Date();
        message = "Respuesta enviada correctamente";
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Acción no válida" },
          { status: 400 }
        );
    }

    const updatedReview = await Review.findByIdAndUpdate(reviewId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email")
      .populate("product", "title imageUrl");

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message,
    });
  } catch (error) {
    console.error("Error in review action:", error);
    return NextResponse.json(
      { success: false, error: "Error en la acción: " + error.message },
      { status: 500 }
    );
  }
}
