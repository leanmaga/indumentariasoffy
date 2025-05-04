// app/api/reviews/[reviewId]/helpful/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import authOptions from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión" },
        { status: 401 }
      );
    }

    await connectDB();

    const review = await Review.findById(params.reviewId);

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Reseña no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si el usuario ya ha votado
    const hasVoted = review.helpfulVotes.some(
      (vote) => vote.user.toString() === session.user.id
    );

    if (hasVoted) {
      // Remover el voto
      review.helpfulVotes = review.helpfulVotes.filter(
        (vote) => vote.user.toString() !== session.user.id
      );
      review.helpful -= 1;
    } else {
      // Agregar el voto
      review.helpfulVotes.push({ user: session.user.id });
      review.helpful += 1;
    }

    await review.save();

    return NextResponse.json({
      success: true,
      helpful: review.helpful,
      hasVoted: !hasVoted,
    });
  } catch (error) {
    console.error("Error updating helpful votes:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar el voto" },
      { status: 500 }
    );
  }
}
