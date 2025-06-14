// api/mercadopago/webhook/route.js - WEBHOOK CORREGIDO CON EMAILS
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import crypto from "crypto";
import { getPaymentById } from "@/lib/mercadopago";
import { sendPaymentConfirmedEmails } from "@/lib/order-emails";
import { verifyEmailConfig } from "@/lib/email-config";

// Función para verificar firma del webhook (opcional pero recomendada)
function verifyWebhookSignature(rawBody, signature) {
  if (!process.env.MERCADOPAGO_WEBHOOK_SECRET || !signature) {
    console.log("⚠️ Webhook signature verification skipped");
    return true; // Permitir si no hay secret configurado
  }

  try {
    const [ts, v1] = signature.split(",").map((part) => part.split("=")[1]);
    const signedPayload = `ts=${ts},v1=${v1}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.MERCADOPAGO_WEBHOOK_SECRET)
      .update(`${ts}.${rawBody}`)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(v1, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("❌ Error verificando firma:", error);
    return false;
  }
}

export async function POST(request) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID().substring(0, 8);

  console.log(`🚀 [${requestId}] Webhook iniciado:`, {
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
  });

  // Log de headers para debugging
  const headers = Object.fromEntries(request.headers.entries());
  console.log(`📋 [${requestId}] Headers recibidos:`, {
    "content-type": headers["content-type"],
    "x-signature": headers["x-signature"] ? "PRESENTE" : "AUSENTE",
    "user-agent": headers["user-agent"],
  });

  try {
    // 1. Leer el body
    const bodyText = await request.text();
    console.log(`📄 [${requestId}] Body recibido:`, {
      length: bodyText.length,
      preview: bodyText.substring(0, 200) + "...",
    });

    // 2. Verificar firma (comentado temporalmente para debugging)
    /*
    if (process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      const signature = request.headers.get("x-signature") || "";
      const isValid = verifyWebhookSignature(bodyText, signature);
      if (!isValid && process.env.NODE_ENV === "production") {
        console.log(`❌ [${requestId}] Firma inválida - RECHAZANDO`);
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
      }
    }
    */

    // 3. Parsear JSON
    let data;
    try {
      data = JSON.parse(bodyText);
      console.log(`✅ [${requestId}] JSON parseado:`, {
        action: data.action,
        dataId: data.data?.id,
        type: data.type,
      });
    } catch (error) {
      console.error(`❌ [${requestId}] Error parseando JSON:`, error);
      return NextResponse.json(
        {
          message: "Invalid JSON",
          requestId,
        },
        { status: 200 }
      );
    }

    // 4. Verificar que es una notificación de pago
    if (!["payment.created", "payment.updated"].includes(data.action)) {
      console.log(`ℹ️ [${requestId}] No es notificación de pago:`, data.action);
      return NextResponse.json({
        message: "Not a payment notification",
        action: data.action,
        requestId,
      });
    }

    // 5. Obtener ID del pago
    const paymentId = data.data?.id;
    if (!paymentId) {
      console.log(`❌ [${requestId}] No payment ID encontrado`);
      return NextResponse.json(
        {
          message: "No payment ID",
          requestId,
        },
        { status: 200 }
      );
    }

    console.log(`💳 [${requestId}] Procesando pago ID: ${paymentId}`);

    // 6. Obtener información del pago desde MercadoPago
    let paymentInfo;
    try {
      paymentInfo = await getPaymentById(paymentId);
      console.log(`✅ [${requestId}] Info del pago obtenida:`, {
        id: paymentInfo.id,
        status: paymentInfo.status,
        external_reference: paymentInfo.external_reference,
        amount: paymentInfo.transaction_amount,
      });
    } catch (error) {
      console.error(`❌ [${requestId}] Error obteniendo info del pago:`, error);
      return NextResponse.json(
        {
          message: "Payment info error",
          error: error.message,
          requestId,
        },
        { status: 200 }
      );
    }

    // 7. Verificar external_reference
    const externalReference = paymentInfo.external_reference;
    if (!externalReference) {
      console.log(`❌ [${requestId}] No external reference encontrado`);
      return NextResponse.json(
        {
          message: "No external reference",
          requestId,
        },
        { status: 200 }
      );
    }

    // 8. Conectar a la base de datos y buscar la orden
    await connectDB();
    const order = await Order.findById(externalReference);

    if (!order) {
      console.log(
        `❌ [${requestId}] Orden no encontrada: ${externalReference}`
      );
      return NextResponse.json(
        {
          message: "Order not found",
          externalReference,
          requestId,
        },
        { status: 200 }
      );
    }

    console.log(`📦 [${requestId}] Orden encontrada:`, {
      orderId: order._id,
      currentStatus: order.status,
      userId: order.user,
      total: order.totalAmount,
    });

    // 9. Procesar según el estado del pago
    const paymentStatus = paymentInfo.status;
    const previousStatus = order.status;

    if (paymentStatus === "approved" && order.status !== "pagado") {
      console.log(`💰 [${requestId}] Pago aprobado - Procesando...`);

      // 10. Obtener información del usuario
      const user = await User.findById(order.user);
      if (!user) {
        console.warn(
          `⚠️ [${requestId}] Usuario no encontrado para la orden ${order._id}`
        );
        return NextResponse.json(
          {
            message: "User not found",
            orderId: order._id,
            requestId,
          },
          { status: 200 }
        );
      }

      console.log(`👤 [${requestId}] Usuario encontrado:`, {
        userId: user._id,
        name: user.name,
        email: user.email,
      });

      // 11. Verificar configuración de email antes de enviar
      console.log(`📧 [${requestId}] Verificando configuración de email...`);
      const emailConfigCheck = await verifyEmailConfig();
      console.log(
        `📧 [${requestId}] Resultado verificación email:`,
        emailConfigCheck
      );

      // 12. Actualizar la orden
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

      // 13. ENVIAR EMAILS DE CONFIRMACIÓN
      let emailResults = null;
      try {
        console.log(`📧 [${requestId}] Enviando emails de confirmación...`);

        emailResults = await sendPaymentConfirmedEmails(
          order,
          user,
          paymentInfo
        );

        console.log(`📧 [${requestId}] Resultado emails:`, {
          success: emailResults.success,
          customerSuccess: emailResults.customerResult?.success,
          adminSuccess: emailResults.adminResult?.success,
          customerMessageId: emailResults.customerResult?.messageId,
          adminMessageId: emailResults.adminResult?.messageId,
        });

        // Guardar info de emails en la orden
        order.paymentDetails.emailsSent = {
          timestamp: new Date(),
          success: emailResults.success,
          customerResult: {
            success: emailResults.customerResult?.success || false,
            messageId: emailResults.customerResult?.messageId || null,
            error: emailResults.customerResult?.error || null,
          },
          adminResult: {
            success: emailResults.adminResult?.success || false,
            messageId: emailResults.adminResult?.messageId || null,
            error: emailResults.adminResult?.error || null,
          },
          requestId: requestId,
        };

        if (emailResults.success) {
          console.log(`✅ [${requestId}] Emails enviados exitosamente`);
        } else {
          console.error(`❌ [${requestId}] Error en emails:`, {
            customerError: emailResults.customerResult?.error,
            adminError: emailResults.adminResult?.error,
          });
        }
      } catch (emailError) {
        console.error(`❌ [${requestId}] Error crítico enviando emails:`, {
          message: emailError.message,
          stack: emailError.stack,
        });

        // Guardar el error en la orden para debugging
        order.paymentDetails.emailError = {
          timestamp: new Date(),
          error: emailError.message,
          stack: emailError.stack,
          requestId: requestId,
        };
      }

      // 14. Agregar al historial de cambios de estado
      order.paymentDetails.statusHistory.push({
        from: previousStatus,
        to: order.status,
        timestamp: new Date(),
        paymentId: paymentId,
        emailsSent: emailResults?.success || false,
        requestId: requestId,
      });

      // 15. Guardar la orden
      await order.save();

      const processingTime = Date.now() - startTime;
      console.log(
        `✅ [${requestId}] Webhook procesado exitosamente en ${processingTime}ms`
      );

      return NextResponse.json({
        message: "Webhook processed successfully",
        requestId,
        orderId: order._id,
        previousStatus,
        newStatus: order.status,
        emailsSent: emailResults?.success || false,
        emailDetails: {
          customer: emailResults?.customerResult?.success || false,
          admin: emailResults?.adminResult?.success || false,
          customerMessageId: emailResults?.customerResult?.messageId,
          adminMessageId: emailResults?.adminResult?.messageId,
        },
        processed: true,
        processingTimeMs: processingTime,
      });
    } else {
      // El pago no está aprobado o la orden ya está pagada
      console.log(`ℹ️ [${requestId}] No requiere actualización:`, {
        paymentStatus,
        orderStatus: order.status,
      });

      return NextResponse.json({
        message: "No update required",
        requestId,
        paymentStatus,
        orderStatus: order.status,
        processed: false,
      });
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`💥 [${requestId}] ERROR GENERAL del webhook:`, {
      message: error.message,
      stack: error.stack,
      processingTimeMs: processingTime,
    });

    return NextResponse.json(
      {
        message: `Error: ${error.message}`,
        requestId,
        processingTimeMs: processingTime,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 200 } // Siempre devolver 200 para que MP no reintente
    );
  }
}

// También agregar método GET para verificar que el endpoint funciona
export async function GET() {
  return NextResponse.json({
    message: "MercadoPago Webhook Endpoint",
    status: "active",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
