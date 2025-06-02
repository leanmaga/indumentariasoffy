// src/app/api/admin/cleanup-orders/route.js - NUEVA API
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function POST(request) {
  try {
    // Solo admins pueden ejecutar la limpieza
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await connectDB();

    // Definir ventanas de tiempo
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Cancelar órdenes pendientes de más de 30 minutos
    const pendingResult = await Order.updateMany(
      {
        status: { $in: ["pendiente", "whatsapp_pendiente"] },
        createdAt: { $lt: thirtyMinutesAgo },
        // Asegurar que no tengan ya info de cancelación
        "paymentDetails.cancelledAt": { $exists: false },
      },
      {
        status: "cancelado",
        $set: {
          "paymentDetails.cancelledReason":
            "Timeout automático - 30 minutos sin pago",
          "paymentDetails.cancelledAt": new Date(),
        },
      }
    );

    // Obtener estadísticas actualizadas
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      results: {
        cancelledOrders: pendingResult.modifiedCount,
        currentStats: stats,
      },
      message: `Limpieza completada: ${pendingResult.modifiedCount} órdenes canceladas`,
    });
  } catch (error) {
    console.error("Error en limpieza de órdenes:", error);
    return NextResponse.json(
      { error: "Error al ejecutar limpieza" },
      { status: 500 }
    );
  }
}

// GET para obtener estadísticas sin ejecutar limpieza
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await connectDB();

    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Contar órdenes que necesitan limpieza
    const pendingToCancel = await Order.countDocuments({
      status: { $in: ["pendiente", "whatsapp_pendiente"] },
      createdAt: { $lt: thirtyMinutesAgo },
      "paymentDetails.cancelledAt": { $exists: false },
    });

    // Estadísticas generales
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    return NextResponse.json({
      needsCleanup: {
        pendingToCancel,
      },
      currentStats: stats,
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
