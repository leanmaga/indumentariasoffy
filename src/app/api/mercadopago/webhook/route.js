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
  // ===== DEBUGGING SECTION =====
  console.log("🚀 === WEBHOOK DEBUG INICIADO ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("URL completa:", request.url);
  console.log("Method:", request.method);

  // Log de headers
  const headers = Object.fromEntries(request.headers.entries());
  console.log("📋 Headers recibidos:", headers);

  // Log de variables de entorno importantes
  console.log("🔧 Variables de entorno:");
  console.log("- NODE_ENV:", process.env.NODE_ENV);
  console.log("- NEXT_PUBLIC_BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL);
  console.log(
    "- MERCADOPAGO_ACCESS_TOKEN exists:",
    !!process.env.MERCADOPAGO_ACCESS_TOKEN
  );
  console.log(
    "- WEBHOOK_SECRET exists:",
    !!process.env.MERCADOPAGO_WEBHOOK_SECRET
  );

  try {
    const bodyText = await request.text();
    console.log("📦 Body recibido:", bodyText);

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
      console.log("✅ JSON parseado correctamente:", data);
    } catch (error) {
      console.error("❌ Error parseando JSON:", error);
      return NextResponse.json({ message: "Invalid JSON" }, { status: 200 });
    }

    // Verificar que es una notificación de pago
    if (
      data.action === "payment.created" ||
      data.action === "payment.updated"
    ) {
      console.log("💳 Es notificación de pago - continuando...");

      const paymentId = data.data?.id;
      if (!paymentId) {
        console.log("❌ No hay payment ID");
        return NextResponse.json({ message: "No payment ID" }, { status: 200 });
      }

      console.log(`🔍 Buscando info del pago ID: ${paymentId}`);

      // Aquí continúa tu lógica normal...
      // Pero con logs adicionales

      let paymentInfo;
      try {
        paymentInfo = await getPaymentById(paymentId);
        console.log("✅ Info del pago obtenida:", {
          id: paymentInfo.id,
          status: paymentInfo.status,
          external_reference: paymentInfo.external_reference,
        });
      } catch (error) {
        console.error("❌ Error obteniendo info del pago:", error);
        return NextResponse.json(
          { message: "Payment info error" },
          { status: 200 }
        );
      }

      const externalReference = paymentInfo.external_reference;
      if (!externalReference) {
        console.log("❌ No hay external_reference");
        return NextResponse.json(
          { message: "No external reference" },
          { status: 200 }
        );
      }

      console.log(`🔍 Buscando orden: ${externalReference}`);

      await connectDB();
      const order = await Order.findById(externalReference);

      if (!order) {
        console.log(`❌ Orden ${externalReference} no encontrada`);
        return NextResponse.json(
          { message: "Order not found" },
          { status: 200 }
        );
      }

      console.log(`✅ Orden encontrada - Estado actual: ${order.status}`);

      const paymentStatus = paymentInfo.status;
      const previousStatus = order.status;

      // Log del cambio de estado
      console.log(`🔄 Cambio de estado: ${previousStatus} → `, {
        paymentStatus,
        shouldUpdate: paymentStatus === "approved" && order.status !== "pagado",
      });

      // Actualizar según el estado
      if (paymentStatus === "approved" && order.status !== "pagado") {
        console.log("✅ ACTUALIZANDO ESTADO A PAGADO");

        // Obtener información del usuario ANTES de actualizar
        const user = await User.findById(order.user);
        if (!user) {
          console.warn(`⚠️ Usuario no encontrado para la orden ${order._id}`);
          return NextResponse.json(
            { message: "User not found" },
            { status: 200 }
          );
        }

        console.log(`👤 Usuario encontrado: ${user.email}`);

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
        console.log("📧 Enviando emails de confirmación...");
        try {
          emailResults = await sendPaymentConfirmedEmails(
            order,
            user,
            paymentInfo
          );

          console.log("✅ Resultado de emails:", {
            success: emailResults.success,
            customer: emailResults.customerResult?.success,
            admin: emailResults.adminResult?.success,
          });

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

          // ⚠️ NO fallar el webhook por errores de email
          console.log("⚠️ Continuando sin emails...");
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

        console.log("✅ ORDEN GUARDADA EXITOSAMENTE CON EMAILS");

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
        console.log("ℹ️ No se requiere actualización:", {
          paymentStatus,
          currentOrderStatus: order.status,
        });

        return NextResponse.json({
          message: "No update required",
          paymentStatus,
          orderStatus: order.status,
        });
      }
    } else {
      console.log("⚠️ No es notificación de pago:", data.action);
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
