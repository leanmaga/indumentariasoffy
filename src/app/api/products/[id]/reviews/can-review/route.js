// app/api/products/[productId]/reviews/can-review/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Order from "@/models/Order";
import authOptions from "@/lib/auth";

// Función para verificar si el usuario ha comprado el producto
async function hasUserPurchasedProduct(userId, productId) {
  const order = await Order.findOne({
    user: userId,
    "items.product": productId,
    status: { $in: ["completed", "delivered"] },
  });

  return !!order;
}

// GET - Verificar si el usuario puede reseñar un producto
export async function GET(request, { params }) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({
        success: true,
        canReview: false,
        reason: "not_authenticated",
      });
    }

    await connectDB();

    // Verificar si ya dejó una reseña
    const existingReview = await Review.findOne({
      product: awaitedParams.productId,
      user: session.user.id,
    });

    if (existingReview) {
      return NextResponse.json({
        success: true,
        canReview: false,
        reason: "already_reviewed",
      });
    }

    // Verificar si compró el producto
    const hasPurchased = await hasUserPurchasedProduct(
      session.user.id,
      awaitedParams.productId
    );

    if (!hasPurchased) {
      return NextResponse.json({
        success: true,
        canReview: false,
        reason: "not_purchased",
      });
    }

    return NextResponse.json({
      success: true,
      canReview: true,
      reason: null,
    });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return NextResponse.json(
      { success: false, error: "Error al verificar elegibilidad" },
      { status: 500 }
    );
  }
}
