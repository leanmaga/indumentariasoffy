// app/api/admin/reviews/bulk/route.js - API PARA ACCIONES MASIVAS
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar que sea administrador
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    const { action, reviewIds } = await request.json();

    // Validar parámetros
    if (
      !action ||
      !reviewIds ||
      !Array.isArray(reviewIds) ||
      reviewIds.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Acción y IDs de reviews son requeridos" },
        { status: 400 }
      );
    }

    // Validar que sea una acción permitida
    const allowedActions = [
      "delete",
      "mark_verified",
      "mark_reported",
      "remove_reports",
    ];
    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: "Acción no válida" },
        { status: 400 }
      );
    }

    await connectDB();

    let result = { affected: 0, errors: [] };

    switch (action) {
      case "delete":
        result = await bulkDeleteReviews(reviewIds);
        break;

      case "mark_verified":
        result = await bulkMarkVerified(reviewIds);
        break;

      case "mark_reported":
        result = await bulkMarkReported(reviewIds);
        break;

      case "remove_reports":
        result = await bulkRemoveReports(reviewIds);
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Acción no implementada" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      affected: result.affected,
      errors: result.errors,
      message: `${action} completado: ${result.affected} reviews procesadas`,
    });
  } catch (error) {
    console.error("Error in bulk action:", error);
    return NextResponse.json(
      { success: false, error: "Error en la acción masiva: " + error.message },
      { status: 500 }
    );
  }
}

// Función para eliminar reviews masivamente
async function bulkDeleteReviews(reviewIds) {
  const result = { affected: 0, errors: [] };

  try {
    // Obtener las reviews antes de eliminarlas para actualizar stats de productos
    const reviewsToDelete = await Review.find({ _id: { $in: reviewIds } });

    // Agrupar por producto para optimizar updates
    const productUpdates = new Map();

    reviewsToDelete.forEach((review) => {
      if (review.type === "rating") {
        const productId = review.product.toString();
        if (!productUpdates.has(productId)) {
          productUpdates.set(productId, []);
        }
        productUpdates.get(productId).push(review);
      }
    });

    // Eliminar las reviews
    const deleteResult = await Review.deleteMany({ _id: { $in: reviewIds } });
    result.affected = deleteResult.deletedCount;

    // Actualizar estadísticas de productos afectados
    for (const [productId, reviews] of productUpdates) {
      try {
        await updateProductRatingStats(productId);
      } catch (error) {
        result.errors.push(
          `Error updating product ${productId}: ${error.message}`
        );
      }
    }
  } catch (error) {
    result.errors.push(`Delete error: ${error.message}`);
  }

  return result;
}

// Función para marcar como verificadas
async function bulkMarkVerified(reviewIds) {
  const result = { affected: 0, errors: [] };

  try {
    const updateResult = await Review.updateMany(
      { _id: { $in: reviewIds } },
      { $set: { verified: true } }
    );

    result.affected = updateResult.modifiedCount;
  } catch (error) {
    result.errors.push(`Mark verified error: ${error.message}`);
  }

  return result;
}

// Función para marcar como reportadas
async function bulkMarkReported(reviewIds) {
  const result = { affected: 0, errors: [] };

  try {
    const updateResult = await Review.updateMany(
      { _id: { $in: reviewIds } },
      {
        $set: {
          reported: true,
          reportedAt: new Date(),
          reportedBy: "admin_bulk_action",
        },
      }
    );

    result.affected = updateResult.modifiedCount;
  } catch (error) {
    result.errors.push(`Mark reported error: ${error.message}`);
  }

  return result;
}

// Función para quitar reportes
async function bulkRemoveReports(reviewIds) {
  const result = { affected: 0, errors: [] };

  try {
    const updateResult = await Review.updateMany(
      { _id: { $in: reviewIds } },
      {
        $unset: {
          reported: "",
          reportedAt: "",
          reportedBy: "",
          reportReason: "",
        },
      }
    );

    result.affected = updateResult.modifiedCount;
  } catch (error) {
    result.errors.push(`Remove reports error: ${error.message}`);
  }

  return result;
}

// Función para actualizar estadísticas de rating de un producto
async function updateProductRatingStats(productId) {
  try {
    // Recalcular estadísticas de ratings para este producto
    const stats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
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
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        numReviews: stats[0].numReviews,
      });
    } else {
      // Si no hay más reviews, resetear a 0
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0,
      });
    }
  } catch (error) {
    console.error(`Error updating product ${productId} stats:`, error);
    throw error;
  }
}

// GET para obtener información sobre acciones disponibles
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    const availableActions = [
      {
        id: "delete",
        name: "Eliminar",
        description: "Elimina permanentemente las reviews seleccionadas",
        destructive: true,
        icon: "trash",
      },
      {
        id: "mark_verified",
        name: "Marcar como verificadas",
        description: "Marca las reviews como verificadas (cliente que compró)",
        destructive: false,
        icon: "check-circle",
      },
      {
        id: "mark_reported",
        name: "Marcar como reportadas",
        description: "Marca las reviews como reportadas para moderación",
        destructive: false,
        icon: "exclamation-triangle",
      },
      {
        id: "remove_reports",
        name: "Quitar reportes",
        description: "Remueve el estado de reportada de las reviews",
        destructive: false,
        icon: "x-circle",
      },
    ];

    return NextResponse.json({
      success: true,
      actions: availableActions,
    });
  } catch (error) {
    console.error("Error getting bulk actions:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener acciones disponibles" },
      { status: 500 }
    );
  }
}
