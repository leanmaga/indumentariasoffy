// app/api/admin/reviews/route.js - API PRINCIPAL PARA ADMIN REVIEWS
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";
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

    const { searchParams } = new URL(request.url);

    // Parámetros de filtro
    const type = searchParams.get("type") || ""; // rating, question, ""
    const rating = searchParams.get("rating") || "all"; // all, 5, 4, 3, 2, 1
    const status = searchParams.get("status") || "all"; // all, verified, reported, pending
    const sort = searchParams.get("sort") || "newest"; // newest, oldest, highest, lowest, helpful
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    await connectDB();

    // Construir query base
    let matchQuery = {};

    // Filtrar por tipo si se especifica
    if (type && ["rating", "question"].includes(type)) {
      matchQuery.type = type;
    }

    // Filtrar por rating si se especifica y es tipo rating
    if (rating !== "all" && !isNaN(parseInt(rating))) {
      matchQuery.rating = parseInt(rating);
      // Si filtramos por rating, automáticamente filtramos por tipo rating
      matchQuery.type = "rating";
    }

    // Filtrar por status
    if (status === "verified") {
      matchQuery.verified = true;
    } else if (status === "reported") {
      matchQuery.reported = true;
    } else if (status === "pending") {
      matchQuery.type = "question";
      matchQuery.$or = [
        { response: { $exists: false } },
        { response: "" },
        { response: null },
      ];
    }

    // Configurar sort
    let sortQuery = {};
    switch (sort) {
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      case "highest":
        sortQuery = { rating: -1, createdAt: -1 };
        break;
      case "lowest":
        sortQuery = { rating: 1, createdAt: -1 };
        break;
      case "helpful":
        sortQuery = { helpful: -1, createdAt: -1 };
        break;
      case "newest":
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    // Obtener reviews con populate
    const reviews = await Review.find(matchQuery)
      .populate("user", "name email")
      .populate("product", "title imageUrl")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    // Contar total para paginación
    const totalCount = await Review.countDocuments(matchQuery);

    // Calcular estadísticas generales
    const stats = await calculateReviewStats();

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        current: page,
        total: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        limit,
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener reviews: " + error.message },
      { status: 500 }
    );
  }
}

// Función para calcular estadísticas
async function calculateReviewStats() {
  try {
    // Estadísticas básicas
    const totalReviews = await Review.countDocuments();
    const totalRatings = await Review.countDocuments({ type: "rating" });
    const totalQuestions = await Review.countDocuments({ type: "question" });
    const verifiedCount = await Review.countDocuments({ verified: true });
    const reportedCount = await Review.countDocuments({ reported: true });

    // Promedio de ratings
    const ratingStats = await Review.aggregate([
      { $match: { type: "rating" } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    const averageRating =
      ratingStats.length > 0 ? ratingStats[0].averageRating : 0;

    // Distribución de ratings
    const distribution = await Review.aggregate([
      { $match: { type: "rating" } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convertir distribución a array [1estrella, 2estrellas, 3estrellas, 4estrellas, 5estrellas]
    const ratingDistribution = [0, 0, 0, 0, 0];
    distribution.forEach((item) => {
      if (item._id >= 1 && item._id <= 5) {
        ratingDistribution[item._id - 1] = item.count;
      }
    });

    return {
      totalReviews,
      totalRatings,
      totalQuestions,
      averageRating,
      verifiedCount,
      reportedCount,
      ratingDistribution,
    };
  } catch (error) {
    console.error("Error calculating stats:", error);
    return {
      totalReviews: 0,
      totalRatings: 0,
      totalQuestions: 0,
      averageRating: 0,
      verifiedCount: 0,
      reportedCount: 0,
      ratingDistribution: [0, 0, 0, 0, 0],
    };
  }
}
