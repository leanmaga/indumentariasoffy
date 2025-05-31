// app/api/admin/analytics/reviews/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
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
    const range = searchParams.get("range") || "30d";

    // Calcular fechas
    const now = new Date();
    const daysMap = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
    const days = daysMap[range] || 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    await connectDB();

    // 1. Métricas generales
    const totalReviews = await Review.countDocuments({
      createdAt: { $gte: startDate },
    });

    const previousPeriodStart = new Date(
      startDate.getTime() - days * 24 * 60 * 60 * 1000
    );
    const previousTotalReviews = await Review.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: startDate },
    });

    // 2. Rating promedio
    const ratingStats = await Review.aggregate([
      {
        $match: {
          type: "rating",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const averageRating = ratingStats[0]?.avgRating || 0;

    // 3. Tasa de respuesta
    const questions = await Review.countDocuments({
      type: "question",
      createdAt: { $gte: startDate },
    });

    const answeredQuestions = await Review.countDocuments({
      type: "question",
      response: { $exists: true, $ne: "" },
      createdAt: { $gte: startDate },
    });

    const responseRate =
      questions > 0 ? (answeredQuestions / questions) * 100 : 0;

    // 4. Tiempo promedio de respuesta
    const responseTimeData = await Review.aggregate([
      {
        $match: {
          type: "question",
          response: { $exists: true, $ne: "" },
          responseDate: { $exists: true },
          createdAt: { $gte: startDate },
        },
      },
      {
        $project: {
          responseTime: {
            $divide: [
              { $subtract: ["$responseDate", "$createdAt"] },
              1000 * 60 * 60, // convertir a horas
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: "$responseTime" },
        },
      },
    ]);

    const avgResponseTime = Math.round(
      responseTimeData[0]?.avgResponseTime || 0
    );

    // 5. Distribución de calificaciones
    const ratingDistribution = await Review.aggregate([
      {
        $match: {
          type: "rating",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    const distribution = [0, 0, 0, 0, 0];
    ratingDistribution.forEach((item) => {
      if (item._id >= 1 && item._id <= 5) {
        distribution[item._id - 1] = item.count;
      }
    });

    // 6. Productos más comentados
    const topProducts = await Review.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$product",
          totalReviews: { $sum: 1 },
          totalQuestions: {
            $sum: { $cond: [{ $eq: ["$type", "question"] }, 1, 0] },
          },
          totalRatings: {
            $sum: { $cond: [{ $eq: ["$type", "rating"] }, 1, 0] },
          },
          averageRating: {
            $avg: { $cond: [{ $eq: ["$type", "rating"] }, "$rating", null] },
          },
        },
      },
      { $sort: { totalReviews: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $project: {
          totalReviews: 1,
          totalQuestions: 1,
          totalRatings: 1,
          averageRating: { $ifNull: ["$averageRating", 0] },
          title: { $arrayElemAt: ["$productInfo.title", 0] },
          imageUrl: { $arrayElemAt: ["$productInfo.imageUrl", 0] },
        },
      },
    ]);

    // 7. Datos para gráficos por día
    const dailyStats = await Review.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            type: "$type",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    // Procesar datos diarios
    const ratingsOverTime = [];
    const questionsOverTime = [];
    const dateMap = {};

    // Crear mapa de fechas
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      dateMap[dateStr] = {
        ratings: 0,
        questions: 0,
        label: date.toLocaleDateString("es-ES", {
          month: "short",
          day: "numeric",
        }),
      };
    }

    // Llenar con datos reales
    dailyStats.forEach((item) => {
      const date = item._id.date;
      if (dateMap[date]) {
        if (item._id.type === "rating") {
          dateMap[date].ratings = item.count;
        } else if (item._id.type === "question") {
          dateMap[date].questions = item.count;
        }
      }
    });

    // Convertir a arrays para gráficos
    Object.values(dateMap).forEach((day) => {
      ratingsOverTime.push({
        label: day.label,
        value: day.ratings,
      });
      questionsOverTime.push({
        label: day.label,
        value: day.questions,
      });
    });

    // 8. Tendencias (comparación con período anterior)
    const recentTrends = {
      totalReviewsChange:
        previousTotalReviews > 0
          ? ((totalReviews - previousTotalReviews) / previousTotalReviews) * 100
          : 0,
    };

    // Construir respuesta
    const analytics = {
      overview: {
        totalReviews,
        averageRating,
        responseRate,
        avgResponseTime,
        topProducts,
        recentTrends,
      },
      charts: {
        ratingsOverTime,
        questionsOverTime,
        ratingDistribution: distribution,
        responseTimeTrend: [], // Se puede implementar más adelante
      },
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error fetching review analytics:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener analytics" },
      { status: 500 }
    );
  }
}

// Actualización del modelo Review.js para incluir reportes
/* 
Agregar al modelo Review.js:

// Campos para reportes
reports: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
],
reported: {
  type: Boolean,
  default: false,
},

*/
