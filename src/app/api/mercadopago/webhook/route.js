// debug-mercadopago.js - COMPLETO CON EMAILS
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import crypto from "crypto";
import { getPaymentById } from "@/lib/mercadopago";
import {
  sendPaymentConfirmedEmails, // 🆕 Usar función combinada
} from "@/lib/order-emails";

export async function POST(request) {
  // Log de headers
  const headers = Object.fromEntries(request.headers.entries());

  try {
    const bodyText = await request.text();

    // ===== COMENTAR VERIFICACIÓN DE FIRMA TEMPORALMENTE =====
    /*
    if (process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      const signature = request.headers.get("x-signature") || "";
      const isValid = verifyWebhookSignature(bodyText, signature);
      if (!isValid && process.env.NODE_ENV === "production") {
        console.log("❌ Firma inválida - RECHAZANDO");
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
      }
    }
    */

    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (error) {
      console.error("❌ Error parseando JSON:", error);
      return NextResponse.json({ message: "Invalid JSON" }, { status: 200 });
    }

    // Verificar que es una notificación de pago
    if (
      data.action === "payment.created" ||
      data.action === "payment.updated"
    ) {
      const paymentId = data.data?.id;
      if (!paymentId) {
        return NextResponse.json({ message: "No payment ID" }, { status: 200 });
      }

      let paymentInfo;
      try {
        paymentInfo = await getPaymentById(paymentId);
      } catch (error) {
        console.error("❌ Error obteniendo info del pago:", error);
        return NextResponse.json(
          { message: "Payment info error" },
          { status: 200 }
        );
      }

      const externalReference = paymentInfo.external_reference;
      if (!externalReference) {
        return NextResponse.json(
          { message: "No external reference" },
          { status: 200 }
        );
      }

      await connectDB();
      const order = await Order.findById(externalReference);

      if (!order) {
        return NextResponse.json(
          { message: "Order not found" },
          { status: 200 }
        );
      }

      const paymentStatus = paymentInfo.status;
      const previousStatus = order.status;

      // Actualizar según el estado
      if (paymentStatus === "approved" && order.status !== "pagado") {
        // Obtener información del usuario ANTES de actualizar
        const user = await User.findById(order.user);
        if (!user) {
          console.warn(`⚠️ Usuario no encontrado para la orden ${order._id}`);
          return NextResponse.json(
            { message: "User not found" },
            { status: 200 }
          );
        }

        order.status = "pagado";
        order.paymentId = paymentId;

        // Actualizar detalles del pago
        order.paymentDetails = {
          ...order.paymentDetails,
          status: paymentStatus,
          method: paymentInfo.payment_method_id,
          type: paymentInfo.payment_type_id,
          lastUpdated: new Date(),
          statusHistory: order.paymentDetails?.statusHistory || [],
        };

        let emailResults = null;

        // 🆕 ENVIAR EMAILS DE CONFIRMACIÓN
        try {
          emailResults = await sendPaymentConfirmedEmails(
            order,
            user,
            paymentInfo
          );

          // Guardar info de emails en la orden
          order.paymentDetails.emailsSent = {
            timestamp: new Date(),
            success: emailResults.success,
            customerResult: emailResults.customerResult,
            adminResult: emailResults.adminResult,
          };
        } catch (emailError) {
          console.error("❌ Error enviando emails:", emailError);

          // Guardar el error en la orden para debugging
          order.paymentDetails.emailError = {
            timestamp: new Date(),
            error: emailError.message,
            stack: emailError.stack,
          };
        }

        // Agregar al historial de cambios de estado
        order.paymentDetails.statusHistory.push({
          from: previousStatus,
          to: order.status,
          timestamp: new Date(),
          paymentId: paymentId,
          emailsSent: emailResults?.success || false,
        });

        await order.save();

        return NextResponse.json({
          message: "Webhook processed successfully",
          orderId: order._id,
          previousStatus,
          newStatus: order.status,
          emailsSent: emailResults?.success || false,
          emailDetails: {
            customer: emailResults?.customerResult?.success || false,
            admin: emailResults?.adminResult?.success || false,
          },
          processed: true,
        });
      } else {
        return NextResponse.json({
          message: "No update required",
          paymentStatus,
          orderStatus: order.status,
        });
      }
    } else {
      return NextResponse.json({
        message: "Not a payment notification",
        action: data.action,
      });
    }
  } catch (error) {
    console.error("❌ === ERROR GENERAL ===", error);
    return NextResponse.json(
      {
        message: `Error: ${error.message}`,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 200 }
    );
  }
}
