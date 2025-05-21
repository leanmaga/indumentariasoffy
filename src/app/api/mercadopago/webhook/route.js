// /api/mercadopago/webhook/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getPaymentStatus } from "@/lib/mercadopago";
import crypto from "crypto";

export async function POST(request) {
  try {
    // Obtener la firma del encabezado
    const signature = request.headers.get('x-signature') || '';
    
    // Clonar el request para poder leer el cuerpo como texto y como JSON
    const clonedRequest = request.clone();
    const bodyText = await request.text();
    
    // Verificar la firma del webhook - NUEVO
    if (process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(bodyText, signature);
      if (!isValid) {
        console.error("Firma de webhook inválida");
        return NextResponse.json({ message: "Firma inválida" }, { status: 200 });
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
      ); // Always return 200
    }

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
        return NextResponse.json(
          { message: "Error getting payment info" },
          { status: 200 }
        );
      }

      // Get order ID from external_reference
      const externalReference = paymentInfo.external_reference;

      if (!externalReference) {
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
          return NextResponse.json(
            { message: "Order not found" },
            { status: 200 }
          );
        }
        // Update status based on payment status
        const paymentStatus = paymentInfo.status;

        // Map payment status to order status
        if (paymentStatus === "approved") {
          order.status = "pagado";
        } else if (paymentStatus === "pending") {
          order.status = "pendiente";
        } else if (
          paymentStatus === "rejected" ||
          paymentStatus === "cancelled"
        ) {
          order.status = "cancelado";
        }

        // Save payment ID
        order.paymentId = paymentId;

        // Add more details for debugging
        order.paymentDetails = {
          status: paymentStatus,
          method: paymentInfo.payment_method_id,
          type: paymentInfo.payment_type_id,
          lastUpdated: new Date(),
        };

        await order.save();
      } catch (error) {
        return NextResponse.json(
          { message: `Error updating order: ${error.message}` },
          { status: 200 }
        );
      }
    }

    // MercadoPago expects a 200 OK response
    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    // Important to return 200 even in case of error to avoid resends
    return NextResponse.json(
      { message: `Error processing webhook: ${error.message}` },
      { status: 200 }
    );
  }
}

// Función para verificar la firma del webhook - NUEVA
function verifyWebhookSignature(body, signature) {
  try {
    if (!signature || !process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      console.warn("No se puede verificar la firma: falta signature o secret");
      return false;
    }
    
    const hmac = crypto.createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET);
    hmac.update(body);
    const calculatedSignature = hmac.digest('hex');
    
    // Comparar firmas (la implementación exacta puede variar según MercadoPago)
    return calculatedSignature === signature;
  } catch (error) {
    console.error("Error al verificar firma:", error);
    return false;
  }
}

// MercadoPago also sends OPTIONS requests for CORS
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