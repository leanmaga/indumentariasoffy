// /api/mercadopago/webhook/route.js - ACTUALIZADO
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getPaymentStatus } from "@/lib/mercadopago";
import crypto from "crypto";

export async function POST(request) {
  try {
    // Obtener la firma del encabezado
    const signature = request.headers.get("x-signature") || "";

    // Clonar el request para poder leer el cuerpo como texto y como JSON
    const clonedRequest = request.clone();
    const bodyText = await request.text();

    // Verificar la firma del webhook
    if (process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(bodyText, signature);
      if (!isValid) {
        console.error("Firma de webhook inválida");
        return NextResponse.json(
          { message: "Firma inválida" },
          { status: 200 }
        );
      }
    }

    // Parse notification data
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid JSON payload" },
        { status: 200 }
      );
    }

    console.log("🔔 Webhook recibido:", data.action, data.data?.id);

    // Verify if it's a payment notification
    if (
      data.action === "payment.created" ||
      data.action === "payment.updated"
    ) {
      // Get payment ID
      const paymentId = data.data?.id;

      if (!paymentId) {
        return NextResponse.json({ message: "No payment ID" }, { status: 200 });
      }

      // Get payment details from MercadoPago
      let paymentInfo;
      try {
        paymentInfo = await getPaymentStatus(paymentId);
      } catch (error) {
        console.error("Error obteniendo info del pago:", error);
        return NextResponse.json(
          { message: "Error getting payment info" },
          { status: 200 }
        );
      }

      // Get order ID from external_reference
      const externalReference = paymentInfo.external_reference;

      if (!externalReference) {
        console.warn("⚠️ No external reference en el pago");
        return NextResponse.json(
          { message: "No external reference" },
          { status: 200 }
        );
      }

      // Update order in database
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

        // Map payment status to order status
        const paymentStatus = paymentInfo.status;
        const previousStatus = order.status;

        if (paymentStatus === "approved") {
          order.status = "pagado";

          // 🆕 CANCELAR OTRAS ÓRDENES PENDIENTES DEL MISMO USUARIO
          await cancelDuplicateOrders(order);
        } else if (paymentStatus === "pending") {
          order.status = "pendiente";
        } else if (
          paymentStatus === "rejected" ||
          paymentStatus === "cancelled" ||
          paymentStatus === "refunded"
        ) {
          order.status = "cancelado";
          console.log(
            `💳 Pago ${paymentStatus} - Orden ${order._id} marcada como cancelada`
          );
        }

        // Save payment ID and details
        order.paymentId = paymentId;

        // Mantener estructura existente de paymentDetails
        order.paymentDetails = {
          status: paymentStatus,
          method: paymentInfo.payment_method_id,
          type: paymentInfo.payment_type_id,
          lastUpdated: new Date(),
          // Agregar historial si no existe
          statusHistory: order.paymentDetails?.statusHistory || [],
        };

        // Agregar al historial si cambió el estado
        if (previousStatus !== order.status) {
          order.paymentDetails.statusHistory.push({
            from: previousStatus,
            to: order.status,
            timestamp: new Date(),
            paymentId: paymentId,
          });
        }

        await order.save();

        console.log(
          `✅ Orden ${order._id} actualizada: ${previousStatus} → ${order.status}`
        );
      } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json(
          { message: `Error updating order: ${error.message}` },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { message: `Error processing webhook: ${error.message}` },
      { status: 200 }
    );
  }
}

// 🆕 NUEVA FUNCIÓN: Cancelar órdenes duplicadas
async function cancelDuplicateOrders(paidOrder) {
  try {
    const timeWindow = 30 * 60 * 1000; // 30 minutos
    const cutoffTime = new Date(paidOrder.createdAt.getTime() - timeWindow);

    // Buscar órdenes pendientes del mismo usuario en ventana de tiempo
    const duplicateOrders = await Order.find({
      _id: { $ne: paidOrder._id }, // Excluir la orden actual
      user: paidOrder.user,
      status: { $in: ["pendiente", "whatsapp_pendiente"] }, // Incluir ambos estados pendientes
      createdAt: { $gte: cutoffTime },
      // Verificar si tienen productos similares
      "items.product": {
        $in: paidOrder.items.map((item) => item.product),
      },
    });

    if (duplicateOrders.length > 0) {
      console.log(`🔄 Cancelando ${duplicateOrders.length} órdenes duplicadas`);

      await Order.updateMany(
        {
          _id: { $in: duplicateOrders.map((o) => o._id) },
        },
        {
          status: "cancelado",
          // Usar la estructura existente de paymentDetails
          $set: {
            "paymentDetails.cancelledReason":
              "Orden duplicada - pago exitoso en otra orden",
            "paymentDetails.cancelledAt": new Date(),
          },
        }
      );

      console.log(
        `✅ Órdenes canceladas: ${duplicateOrders.map((o) => o._id).join(", ")}`
      );
    }
  } catch (error) {
    console.error("Error cancelando órdenes duplicadas:", error);
  }
}

// Función para verificar la firma del webhook
function verifyWebhookSignature(body, signature) {
  try {
    if (!signature || !process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      console.warn("No se puede verificar la firma: falta signature o secret");
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
    console.error("Error al verificar firma:", error);
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
