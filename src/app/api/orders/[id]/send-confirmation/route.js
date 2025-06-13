// src/app/api/orders/[id]/send-confirmation/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { resendEmails } from "@/lib/order-emails";

export async function POST(request, { params }) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const orderId = params.id;

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

    // Obtener información del usuario
    const user = await User.findById(order.user);
    if (!user) {
      return NextResponse.json(
        { message: "Usuario de la orden no encontrado" },
        { status: 404 }
      );
    }

    try {
      // Determinar qué tipo de emails enviar según el estado
      let emailTypes = ["customer"];

      // Si es admin, también enviar al admin
      if (session.user.role === "admin") {
        emailTypes.push("admin");
      }

      // Reenviar emails usando la función existente
      const emailResults = await resendEmails(order, user, emailTypes);

      if (emailResults.success) {
        // Registrar el reenvío en la orden
        order.paymentDetails = {
          ...order.paymentDetails,
          emailResent: {
            timestamp: new Date(),
            triggeredBy: session.user.email,
            emailTypes,
            results: emailResults.results,
          },
        };

        await order.save();

        return NextResponse.json({
          success: true,
          message: "Emails de confirmación reenviados exitosamente",
          results: emailResults.results,
          orderId: order._id,
        });
      } else {
        console.error("❌ Error reenviando emails:", emailResults);

        return NextResponse.json(
          {
            success: false,
            message: "Error al reenviar algunos emails",
            error: emailResults.error,
            results: emailResults.results,
          },
          { status: 500 }
        );
      }
    } catch (emailError) {
      console.error("❌ Error crítico reenviando emails:", emailError);

      return NextResponse.json(
        {
          success: false,
          message: "Error crítico al reenviar emails",
          error: emailError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error general en reenvío de confirmación:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Error interno del servidor: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
