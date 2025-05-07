// /api/mercadopago/webhook/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getPaymentStatus } from "@/lib/mercadopago";

export async function POST(request) {
  console.log("MercadoPago webhook received");

  try {
    // Parse notification data
    let data;
    try {
      data = await request.json();
      console.log("MercadoPago webhook data:", JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error parsing webhook data:", error);
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
        console.error("No payment ID in webhook data");
        return NextResponse.json({ message: "No payment ID" }, { status: 200 });
      }

      console.log(
        `Processing payment notification for payment ID: ${paymentId}`
      );

      // Get payment details from MercadoPago
      let paymentInfo;
      try {
        paymentInfo = await getPaymentStatus(paymentId);
        console.log("Payment info:", JSON.stringify(paymentInfo, null, 2));
      } catch (error) {
        console.error(`Error getting payment info for ID ${paymentId}:`, error);
        return NextResponse.json(
          { message: "Error getting payment info" },
          { status: 200 }
        );
      }

      // Get order ID from external_reference
      const externalReference = paymentInfo.external_reference;

      if (!externalReference) {
        console.error("No external reference in payment info");
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
          console.error(`Order not found: ${externalReference}`);
          return NextResponse.json(
            { message: "Order not found" },
            { status: 200 }
          );
        }

        // Update status based on payment status
        const paymentStatus = paymentInfo.status;
        console.log(
          `Payment status for order ${externalReference}: ${paymentStatus}`
        );

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
        console.log(
          `Order ${externalReference} updated to status: ${order.status}`
        );
      } catch (error) {
        console.error(`Error updating order ${externalReference}:`, error);
        return NextResponse.json(
          { message: `Error updating order: ${error.message}` },
          { status: 200 }
        );
      }
    } else {
      console.log(`Ignoring webhook action: ${data.action}`);
    }

    // MercadoPago expects a 200 OK response
    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing MercadoPago webhook:", error);
    // Important to return 200 even in case of error to avoid resends
    return NextResponse.json(
      { message: `Error processing webhook: ${error.message}` },
      { status: 200 }
    );
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
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
