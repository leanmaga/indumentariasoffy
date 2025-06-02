import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { authOptions } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    console.log("👍 POST Helpful - Iniciando...");

    const { reviewId } = await params;
    console.log("📝 Review ID:", reviewId);

    if (!reviewId) {
      console.log("❌ No reviewId provided");
      return NextResponse.json(
        { success: false, error: "ID de review requerido" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    console.log("👤 User ID:", session?.user?.id);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión para votar" },
        { status: 401 }
      );
    }

    await connectDB();
    console.log("✅ Database connected");

    const review = await Review.findById(reviewId);
    console.log("📋 Review found:", !!review);

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si ya votó
    const alreadyVoted = review.helpfulVotes.some(
      (vote) => vote.user.toString() === session.user.id
    );

    console.log("🗳️ Already voted:", alreadyVoted);

    if (alreadyVoted) {
      return NextResponse.json(
        { success: false, error: "Ya has votado en esta review" },
        { status: 400 }
      );
    }

    // No permitir votar en su propia review
    if (review.user.toString() === session.user.id) {
      return NextResponse.json(
        { success: false, error: "No puedes votar en tu propia review" },
        { status: 400 }
      );
    }

    // Agregar voto
    review.helpfulVotes.push({ user: session.user.id });
    review.helpful = review.helpfulVotes.length;
    await review.save();

    console.log("✅ Vote added successfully, new count:", review.helpful);

    return NextResponse.json({
      success: true,
      helpful: review.helpful,
      message: "¡Gracias por tu voto!",
    });
  } catch (error) {
    console.error("❌ Error marking review as helpful:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar tu voto: " + error.message },
      { status: 500 }
    );
  }
}

// GET para verificar si el usuario ya votó
export async function GET(request, { params }) {
  try {
    const { reviewId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({
        success: true,
        hasVoted: false,
        helpful: 0,
      });
    }

    await connectDB();

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review no encontrada" },
        { status: 404 }
      );
    }

    const hasVoted = review.helpfulVotes.some(
      (vote) => vote.user.toString() === session.user.id
    );

    return NextResponse.json({
      success: true,
      hasVoted,
      helpful: review.helpful || 0,
    });
  } catch (error) {
    console.error("Error checking vote status:", error);
    return NextResponse.json(
      { success: false, error: "Error al verificar estado del voto" },
      { status: 500 }
    );
  }
}
