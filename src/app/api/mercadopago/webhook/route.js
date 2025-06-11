// app/api/mercadopago/webhook/route.js - OPTIMIZADO CON EMAILS
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
  try {
    const bodyText = await request.text();

    // Verificar firma del webhook (opcional)
    if (process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      const signature = request.headers.get("x-signature") || "";
      const isValid = verifyWebhookSignature(bodyText, signature);

      if (!isValid) {
        console.warn("⚠️ Firma del webhook inválida");
        // En desarrollo, continuar; en producción, retornar error
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { message: "Invalid signature" },
            { status: 401 }
          );
        }
      }
    }

    // Parsear datos de la notificación
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (error) {
      console.error("❌ Error parseando JSON:", error);
      return NextResponse.json(
        { message: "Invalid JSON payload" },
        { status: 200 }
      );
    }

    console.log("🔔 Webhook recibido:", JSON.stringify(data, null, 2));

    // Procesar solo notificaciones de pagos
    if (
      data.action === "payment.created" ||
      data.action === "payment.updated"
    ) {
      const paymentId = data.data?.id;

      if (!paymentId) {
        console.warn("⚠️ No hay payment ID en la notificación");
        return NextResponse.json({ message: "No payment ID" }, { status: 200 });
      }

      console.log(`💳 Procesando pago ID: ${paymentId}`);

      // Obtener info del pago usando SDK
      let paymentInfo;
      try {
        paymentInfo = await getPaymentById(paymentId);
      } catch (error) {
        console.error("❌ Error obteniendo info del pago:", error);
        return NextResponse.json(
          { message: "Error getting payment info" },
          { status: 200 }
        );
      }

      const externalReference = paymentInfo.external_reference;

      if (!externalReference) {
        console.warn("⚠️ No hay external_reference en el pago");
        return NextResponse.json(
          { message: "No external reference" },
          { status: 200 }
        );
      }

      // Actualizar orden en la base de datos
      try {
        await connectDB();

        const order = await Order.findById(externalReference);
        if (!order) {
          console.warn(`⚠️ Orden ${externalReference} no encontrada`);
          return NextResponse.json(
            { message: "Order not found" },
            { status: 200 }
          );
        }

        console.log(
          `📦 Orden encontrada: ${order._id}, estado actual: ${order.status}`
        );

        // Obtener información del usuario
        const user = await User.findById(order.user);
        if (!user) {
          console.warn(`⚠️ Usuario no encontrado para la orden ${order._id}`);
          return NextResponse.json(
            { message: "User not found" },
            { status: 200 }
          );
        }

        const paymentStatus = paymentInfo.status;
        const previousStatus = order.status;
        let statusChanged = false;
        let emailResults = null;

        // Mapear estado del pago al estado de la orden
        if (paymentStatus === "approved" && order.status !== "pagado") {
          order.status = "pagado";
          statusChanged = true;

          console.log("✅ Pago aprobado - enviando emails de confirmación");

          // 🆕 USAR FUNCIÓN COMBINADA PARA EMAILS
          try {
            emailResults = await sendPaymentConfirmedEmails(
              order,
              user,
              paymentInfo
            );

            console.log("📧 Resultado de emails:", {
              success: emailResults.success,
              customer: emailResults.customerResult?.success,
              admin: emailResults.adminResult?.success,
            });

            // Guardar info de emails en la orden
            order.paymentDetails = {
              ...order.paymentDetails,
              emailsSent: {
                timestamp: new Date(),
                success: emailResults.success,
                customerResult: emailResults.customerResult,
                adminResult: emailResults.adminResult,
              },
            };
          } catch (emailError) {
            console.error("❌ Error enviando emails:", emailError);

            // Guardar el error en la orden para debugging
            order.paymentDetails = {
              ...order.paymentDetails,
              emailError: {
                timestamp: new Date(),
                error: emailError.message,
                stack: emailError.stack,
              },
            };

            // No fallar el webhook por errores de email
          }

          // Cancelar órdenes duplicadas del mismo usuario
          await cancelDuplicateOrders(order);
        } else if (paymentStatus === "pending") {
          if (order.status !== "pendiente") {
            order.status = "pendiente";
            statusChanged = true;
          }
        } else if (
          paymentStatus === "rejected" ||
          paymentStatus === "cancelled" ||
          paymentStatus === "refunded"
        ) {
          if (order.status !== "cancelado") {
            order.status = "cancelado";
            statusChanged = true;
          }
        }

        // Guardar detalles del pago
        order.paymentId = paymentId;
        order.paymentDetails = {
          ...order.paymentDetails,
          status: paymentStatus,
          method: paymentInfo.payment_method_id,
          type: paymentInfo.payment_type_id,
          lastUpdated: new Date(),
          statusHistory: order.paymentDetails?.statusHistory || [],
        };

        // Agregar al historial de cambios de estado
        if (statusChanged) {
          order.paymentDetails.statusHistory.push({
            from: previousStatus,
            to: order.status,
            timestamp: new Date(),
            paymentId: paymentId,
            emailsSent: emailResults?.success || false,
          });

          console.log(
            `🔄 Estado cambiado: ${previousStatus} → ${order.status}`
          );
        }

        await order.save();

        console.log("✅ Webhook procesado exitosamente:", {
          orderId: order._id,
          paymentStatus,
          orderStatus: order.status,
          emailsSent: emailResults?.success,
          statusChanged,
        });

        // 🆕 RESPUESTA MEJORADA CON MÁS INFO
        return NextResponse.json({
          message: "Webhook processed successfully",
          orderId: order._id,
          paymentStatus,
          orderStatus: order.status,
          emailsSent: emailResults?.success || false,
          processed: true,
        });
      } catch (error) {
        console.error("❌ Error actualizando orden:", error);
        return NextResponse.json(
          { message: `Error updating order: ${error.message}` },
          { status: 200 }
        );
      }
    } else {
      console.warn("⚠️ Notificación no es de pago:", data.action);
      return NextResponse.json(
        { message: "Not a payment notification", action: data.action },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("❌ === ERROR EN WEBHOOK ===", error);
    return NextResponse.json(
      {
        message: `Error processing webhook: ${error.message}`,
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 200 }
    );
  }
}

// Función para cancelar órdenes duplicadas
async function cancelDuplicateOrders(paidOrder) {
  try {
    const timeWindow = 30 * 60 * 1000; // 30 minutos
    const cutoffTime = new Date(paidOrder.createdAt.getTime() - timeWindow);

    const duplicateOrders = await Order.find({
      _id: { $ne: paidOrder._id },
      user: paidOrder.user,
      status: { $in: ["pendiente", "whatsapp_pendiente"] },
      createdAt: { $gte: cutoffTime },
      "items.product": { $in: paidOrder.items.map((item) => item.product) },
    });

    if (duplicateOrders.length > 0) {
      console.log(`🗑️ Cancelando ${duplicateOrders.length} órdenes duplicadas`);

      await Order.updateMany(
        { _id: { $in: duplicateOrders.map((o) => o._id) } },
        {
          status: "cancelado",
          $set: {
            "paymentDetails.cancelledReason":
              "Orden duplicada - pago exitoso en otra orden",
            "paymentDetails.cancelledAt": new Date(),
          },
        }
      );

      console.log(`✅ ${duplicateOrders.length} órdenes duplicadas canceladas`);
    }
  } catch (error) {
    console.error("❌ Error cancelando órdenes duplicadas:", error);
  }
}

// Función para verificar la firma del webhook
function verifyWebhookSignature(body, signature) {
  try {
    if (!signature || !process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      return false;
    }

    const hmac = crypto.createHmac(
      "sha256",
      process.env.MERCADOPAGO_WEBHOOK_SECRET
    );
    hmac.update(body);
    const calculatedSignature = hmac.digest("hex");

    return calculatedSignature === signature;
  } catch (error) {
    console.error("❌ Error verificando firma:", error);
    return false;
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-signature",
      },
    }
  );
}
