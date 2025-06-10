// src/app/api/products/[id]/reviews/can-review/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Order from "@/models/Order";
import { authOptions } from "@/lib/auth";

// Función para verificar si el usuario ha comprado el producto
async function hasUserPurchasedProduct(userId, productId) {
  try {
    const order = await Order.findOne({
      user: userId,
      "items.product": productId,
      status: { $in: ["pagado", "enviado", "entregado"] },
    });
    return !!order;
  } catch (error) {
    // Solo log en desarrollo
    if (process.env.NODE_ENV === "production") {
      console.error("Error checking purchase:", error);
    }
    return false;
  }
}

// GET - Verificar qué tipo de interacciones puede hacer el usuario
export async function GET(request, { params }) {
  try {
    const { id: productId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({
        success: true,
        canQuestion: false,
        canRate: false,
        reasons: {
          question: "not_authenticated",
          rating: "not_authenticated",
        },
      });
    }

    await connectDB();

    // Verificar si ya dejó cada tipo de interacción
    const existingQuestion = await Review.findOne({
      product: productId,
      user: session.user.id,
      type: "question",
    });

    const existingRating = await Review.findOne({
      product: productId,
      user: session.user.id,
      type: "rating",
    });

    // Verificar si compró el producto
    const hasPurchased = await hasUserPurchasedProduct(
      session.user.id,
      productId
    );

    // Lógica para preguntas: cualquier usuario autenticado que no haya preguntado
    const canQuestion = !existingQuestion;
    const questionReason = existingQuestion ? "already_asked" : null;

    // Lógica para calificaciones: solo usuarios que compraron y no han calificado
    const canRate = hasPurchased && !existingRating;
    const ratingReason = existingRating
      ? "already_rated"
      : !hasPurchased
      ? "not_purchased"
      : null;

    return NextResponse.json({
      success: true,
      canQuestion,
      canRate,
      reasons: {
        question: questionReason,
        rating: ratingReason,
      },
      hasPurchased,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.error("❌ Error checking review eligibility:", error);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Error al verificar elegibilidad",
      },
      { status: 500 }
    );
  }
}
