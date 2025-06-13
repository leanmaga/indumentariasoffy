// src/app/api/orders/recreate-payment/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { createPaymentPreference } from "@/lib/mercadopago";

export async function POST(request) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener datos del body
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { message: "ID de orden requerido" },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Buscar la orden
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la orden pertenezca al usuario (a menos que sea admin)
    if (
      session.user.role !== "admin" &&
      order.user.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { message: "No autorizado para esta orden" },
        { status: 403 }
      );
    }

    // Verificar que sea una orden que se pueda reactivar
    const reactivableStatuses = ["pendiente", "cancelado"];
    if (!reactivableStatuses.includes(order.status)) {
      return NextResponse.json(
        {
          message: `No se puede reactivar el pago para una orden con estado: ${order.status}`,
          currentStatus: order.status,
          allowedStatuses: reactivableStatuses,
        },
        { status: 400 }
      );
    }

    // Verificar que use MercadoPago
    if (order.paymentMethod !== "mercadopago") {
      return NextResponse.json(
        { message: "Solo se pueden reactivar pagos de MercadoPago" },
        { status: 400 }
      );
    }

    // Obtener información del usuario
    const user = await User.findById(order.user);
    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    try {
      // Crear nueva preferencia de pago usando tu configuración existente
      const preferenceResponse = await createPaymentPreference(order);

      // Actualizar la orden - preservar datos existentes
      const previousStatus = order.status;
      order.status = "pendiente";

      // Preservar paymentDetails existentes y agregar nueva información
      order.paymentDetails = {
        ...order.paymentDetails,
        reactivated: true,
        reactivatedAt: new Date(),
        reactivatedBy: session.user.email,
        previousStatus: previousStatus,
        newPreferenceId: preferenceResponse.id,
        statusHistory: order.paymentDetails?.statusHistory || [],
      };

      // Agregar al historial de estados
      order.paymentDetails.statusHistory.push({
        from: previousStatus,
        to: "pendiente",
        timestamp: new Date(),
        action: "payment_reactivated",
        triggeredBy: session.user.email,
        preferenceId: preferenceResponse.id,
      });

      await order.save();

      return NextResponse.json({
        success: true,
        message: "Pago reactivado correctamente",
        orderId: order._id,
        paymentInfo: {
          id: preferenceResponse.id,
          init_point: preferenceResponse.init_point,
          sandbox_init_point: preferenceResponse.sandbox_init_point,
        },
        order: {
          id: order._id,
          status: order.status,
          totalAmount: order.totalAmount,
          previousStatus: previousStatus,
        },
      });
    } catch (mpError) {
      console.error("❌ Error al crear preferencia de MercadoPago:", mpError);

      // Registrar el error en la orden para debugging
      order.paymentDetails = {
        ...order.paymentDetails,
        reactivationError: {
          timestamp: new Date(),
          error: mpError.message,
          triggeredBy: session.user.email,
        },
      };

      await order.save();

      return NextResponse.json(
        {
          success: false,
          message: `Error al reactivar el pago: ${mpError.message}`,
          details: "No se pudo crear la preferencia de pago en MercadoPago",
          orderId: order._id,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error general al reactivar pago:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Error interno del servidor: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
