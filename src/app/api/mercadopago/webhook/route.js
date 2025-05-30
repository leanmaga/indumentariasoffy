// /api/mercadopago/webhook/route.js - SIN VERIFICACIÓN DE FIRMA (TEMPORAL)
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getPaymentStatus } from "@/lib/mercadopago";
import crypto from "crypto";

export async function POST(request) {
  try {
    console.log("🔔 === WEBHOOK RECIBIDO ===");

    // Obtener el cuerpo de la request
    const bodyText = await request.text();

    console.log("📋 Body del webhook:", bodyText);

    // 🆕 TEMPORALMENTE SALTEAR VERIFICACIÓN DE FIRMA
    console.log("⚠️ Verificación de firma deshabilitada temporalmente");

    // Parse notification data
    let data;
    try {
      data = JSON.parse(bodyText);
      console.log("📊 Datos parseados:", JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("❌ Error parseando JSON:", error);
      return NextResponse.json(
        { message: "Invalid JSON payload" },
        { status: 200 }
      );
    }

    console.log("🎬 Acción:", data.action);
    console.log("🆔 Payment ID:", data.data?.id);

    // Verificar si es una notificación de pago
    if (
      data.action === "payment.created" ||
      data.action === "payment.updated"
    ) {
      // Obtener ID del pago
      const paymentId = data.data?.id;

      if (!paymentId) {
        console.warn("⚠️ No hay payment ID en la notificación");
        return NextResponse.json({ message: "No payment ID" }, { status: 200 });
      }

      console.log(`🔍 Obteniendo detalles del pago ${paymentId}...`);

      // Obtener detalles del pago desde MercadoPago
      let paymentInfo;
      try {
        paymentInfo = await getPaymentStatus(paymentId);
        console.log("💳 Info del pago:", {
          id: paymentInfo.id,
          status: paymentInfo.status,
          external_reference: paymentInfo.external_reference,
          payment_method: paymentInfo.payment_method_id,
        });
      } catch (error) {
        console.error("❌ Error obteniendo info del pago:", error);
        return NextResponse.json(
          { message: "Error getting payment info" },
          { status: 200 }
        );
      }

      // Obtener ID de la orden desde external_reference
      const externalReference = paymentInfo.external_reference;

      if (!externalReference) {
        console.warn("⚠️ No hay external_reference en el pago");
        return NextResponse.json(
          { message: "No external reference" },
          { status: 200 }
        );
      }

      console.log(`🔍 Buscando orden ${externalReference}...`);

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
          `📦 Orden encontrada: ${order._id} (Estado actual: ${order.status})`
        );

        // Mapear estado del pago al estado de la orden
        const paymentStatus = paymentInfo.status;
        const previousStatus = order.status;

        console.log(`💳 Estado del pago en MP: ${paymentStatus}`);

        if (paymentStatus === "approved") {
          order.status = "pagado";
          console.log("✅ Marcando orden como PAGADA");

          // Cancelar otras órdenes pendientes del mismo usuario
          await cancelDuplicateOrders(order);
        } else if (paymentStatus === "pending") {
          order.status = "pendiente";
          console.log("⏳ Manteniendo orden como PENDIENTE");
        } else if (
          paymentStatus === "rejected" ||
          paymentStatus === "cancelled" ||
          paymentStatus === "refunded"
        ) {
          order.status = "cancelado";
          console.log(`❌ Marcando orden como CANCELADA (${paymentStatus})`);
        }

        // Guardar ID del pago y detalles
        order.paymentId = paymentId;

        // Mantener estructura existente de paymentDetails
        order.paymentDetails = {
          status: paymentStatus,
          method: paymentInfo.payment_method_id,
          type: paymentInfo.payment_type_id,
          lastUpdated: new Date(),
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
          console.log(
            `📝 Historial actualizado: ${previousStatus} → ${order.status}`
          );
        }

        await order.save();

        console.log(
          `✅ Orden ${order._id} actualizada exitosamente: ${previousStatus} → ${order.status}`
        );
      } catch (error) {
        console.error("❌ Error actualizando orden:", error);
        return NextResponse.json(
          { message: `Error updating order: ${error.message}` },
          { status: 200 }
        );
      }
    } else {
      console.log(`ℹ️ Acción no relacionada con pagos: ${data.action}`);
    }

    console.log("✅ === WEBHOOK PROCESADO EXITOSAMENTE ===");
    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("❌ === ERROR EN WEBHOOK ===", error);
    return NextResponse.json(
      { message: `Error processing webhook: ${error.message}` },
      { status: 200 }
    );
  }
}

// Función para cancelar órdenes duplicadas
async function cancelDuplicateOrders(paidOrder) {
  try {
    console.log(
      `🔄 Buscando órdenes duplicadas para usuario ${paidOrder.user}...`
    );

    const timeWindow = 30 * 60 * 1000; // 30 minutos
    const cutoffTime = new Date(paidOrder.createdAt.getTime() - timeWindow);

    const duplicateOrders = await Order.find({
      _id: { $ne: paidOrder._id },
      user: paidOrder.user,
      status: { $in: ["pendiente", "whatsapp_pendiente"] },
      createdAt: { $gte: cutoffTime },
      "items.product": {
        $in: paidOrder.items.map((item) => item.product),
      },
    });

    if (duplicateOrders.length > 0) {
      console.log(
        `🔄 Cancelando ${duplicateOrders.length} órdenes duplicadas:`,
        duplicateOrders.map((o) => o._id)
      );

      await Order.updateMany(
        {
          _id: { $in: duplicateOrders.map((o) => o._id) },
        },
        {
          status: "cancelado",
          $set: {
            "paymentDetails.cancelledReason":
              "Orden duplicada - pago exitoso en otra orden",
            "paymentDetails.cancelledAt": new Date(),
          },
        }
      );

      console.log(`✅ Órdenes duplicadas canceladas exitosamente`);
    } else {
      console.log("ℹ️ No se encontraron órdenes duplicadas");
    }
  } catch (error) {
    console.error("❌ Error cancelando órdenes duplicadas:", error);
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
