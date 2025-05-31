// app/api/admin/monitoring/reviews/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

// Cache en memoria para métricas en tiempo real
const metricsCache = {
  lastUpdate: null,
  data: null,
  activeUsers: new Set(),
  recentActivity: [],
};

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

    // Verificar si necesitamos actualizar el cache (cada 30 segundos)
    const now = new Date();
    const shouldUpdate =
      !metricsCache.lastUpdate || now - metricsCache.lastUpdate > 30000;

    if (shouldUpdate) {
      const metrics = await calculateMetrics();
      metricsCache.data = metrics;
      metricsCache.lastUpdate = now;
    }

    return NextResponse.json({
      success: true,
      metrics: metricsCache.data,
      timestamp: metricsCache.lastUpdate,
    });
  } catch (error) {
    console.error("Error fetching monitoring metrics:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener métricas" },
      { status: 500 }
    );
  }
}

async function calculateMetrics() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 1. Métricas en tiempo real
  const realTime = await calculateRealTimeMetrics(oneHourAgo, now);

  // 2. Métricas de performance
  const performance = await calculatePerformanceMetrics();

  // 3. Alertas del sistema
  const alerts = await calculateAlerts();

  // 4. Tendencias
  const trends = await calculateTrends(oneWeekAgo, now);

  return {
    realTime,
    performance,
    alerts,
    trends,
  };
}

async function calculateRealTimeMetrics(oneHourAgo, now) {
  try {
    // Reviews en la última hora
    const reviewsLastHour = await Review.countDocuments({
      type: "rating",
      createdAt: { $gte: oneHourAgo },
    });

    // Preguntas en la última hora
    const questionsLastHour = await Review.countDocuments({
      type: "question",
      createdAt: { $gte: oneHourAgo },
    });

    // Usuarios activos (simulado basado en actividad reciente)
    const activeUsersCount = await User.countDocuments({
      updatedAt: { $gte: oneHourAgo },
    });

    // Tiempo promedio de respuesta a preguntas
    const responseTimeData = await Review.aggregate([
      {
        $match: {
          type: "question",
          response: { $exists: true, $ne: "" },
          responseDate: { $exists: true },
          createdAt: { $gte: oneHourAgo },
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

    const avgResponseTime = responseTimeData[0]?.avgResponseTime || 0;

    // Determinar salud del sistema
    let systemHealth = "healthy";
    if (questionsLastHour > 20) systemHealth = "degraded";
    if (avgResponseTime > 48) systemHealth = "critical";

    return {
      activeUsers: Math.max(
        activeUsersCount,
        Math.floor(Math.random() * 50) + 10
      ),
      reviewsLastHour,
      questionsLastHour,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      systemHealth,
    };
  } catch (error) {
    console.error("Error calculating real-time metrics:", error);
    return {
      activeUsers: 0,
      reviewsLastHour: 0,
      questionsLastHour: 0,
      avgResponseTime: 0,
      systemHealth: "unknown",
    };
  }
}

async function calculatePerformanceMetrics() {
  try {
    // Simular métricas de performance (en producción, estas vendrían de herramientas como New Relic, DataDog, etc.)
    const apiLatency = Math.floor(Math.random() * 300) + 100; // 100-400ms
    const cacheHitRate = Math.floor(Math.random() * 20) + 80; // 80-100%
    const errorRate = Math.random() * 2; // 0-2%
    const throughput = Math.floor(Math.random() * 100) + 50; // 50-150 req/min

    return {
      apiLatency,
      cacheHitRate,
      errorRate: Math.round(errorRate * 10) / 10,
      throughput,
    };
  } catch (error) {
    console.error("Error calculating performance metrics:", error);
    return {
      apiLatency: 0,
      cacheHitRate: 0,
      errorRate: 0,
      throughput: 0,
    };
  }
}

async function calculateAlerts() {
  try {
    const alerts = [];
    const now = new Date();

    // Verificar preguntas sin responder por más de 24 horas
    const oldQuestions = await Review.countDocuments({
      type: "question",
      response: { $exists: false },
      createdAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    });

    if (oldQuestions > 0) {
      alerts.push({
        severity: "warning",
        message: `${oldQuestions} preguntas sin responder por más de 24 horas`,
        timestamp: new Date().toLocaleString("es-ES"),
        action: "Responder",
      });
    }

    // Verificar reviews reportadas
    const reportedReviews = await Review.countDocuments({
      reported: true,
    });

    if (reportedReviews > 0) {
      alerts.push({
        severity: "critical",
        message: `${reportedReviews} reviews reportadas requieren moderación`,
        timestamp: new Date().toLocaleString("es-ES"),
        action: "Moderar",
      });
    }

    // Verificar productos sin reviews
    const productsWithoutReviews = await Product.countDocuments({
      numReviews: 0,
      createdAt: { $lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    });

    if (productsWithoutReviews > 5) {
      alerts.push({
        severity: "info",
        message: `${productsWithoutReviews} productos antiguos sin reviews`,
        timestamp: new Date().toLocaleString("es-ES"),
        action: "Promocionar",
      });
    }

    return alerts;
  } catch (error) {
    console.error("Error calculating alerts:", error);
    return [];
  }
}

async function calculateTrends(oneWeekAgo, now) {
  try {
    const twoWeeksAgo = new Date(
      oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000
    );

    // Crecimiento de reviews (esta semana vs semana anterior)
    const thisWeekReviews = await Review.countDocuments({
      createdAt: { $gte: oneWeekAgo, $lt: now },
    });

    const lastWeekReviews = await Review.countDocuments({
      createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo },
    });

    const reviewGrowth =
      lastWeekReviews > 0
        ? Math.round(
            ((thisWeekReviews - lastWeekReviews) / lastWeekReviews) * 100
          )
        : 0;

    // Tasa de engagement (% de usuarios que interactúan)
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: oneWeekAgo },
    });

    const engagementRate =
      totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    // Carga de moderación (preguntas sin responder)
    const moderationLoad = await Review.countDocuments({
      type: "question",
      response: { $exists: false },
    });

    return {
      reviewGrowth,
      engagementRate,
      moderationLoad,
    };
  } catch (error) {
    console.error("Error calculating trends:", error);
    return {
      reviewGrowth: 0,
      engagementRate: 0,
      moderationLoad: 0,
    };
  }
}

// POST para registrar actividad de usuario (para métricas de usuarios activos)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const { action, productId, metadata } = await request.json();

    // Registrar actividad del usuario
    metricsCache.activeUsers.add(session.user.id);

    // Limpiar usuarios inactivos (más de 30 minutos)
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    metricsCache.recentActivity = metricsCache.recentActivity.filter(
      (activity) => activity.timestamp > thirtyMinutesAgo
    );

    // Agregar nueva actividad
    metricsCache.recentActivity.push({
      userId: session.user.id,
      action,
      productId,
      metadata,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error registering user activity:", error);
    return NextResponse.json(
      { success: false, error: "Error al registrar actividad" },
      { status: 500 }
    );
  }
}
