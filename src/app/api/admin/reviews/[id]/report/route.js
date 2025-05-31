// app/api/admin/reviews/[reviewId]/report/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { authOptions } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    const { reviewId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión" },
        { status: 401 }
      );
    }

    const { reason } = await request.json();

    if (!reason) {
      return NextResponse.json(
        { success: false, error: "Debes especificar un motivo" },
        { status: 400 }
      );
    }

    await connectDB();

    const review = await Review.findById(reviewId);

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review no encontrada" },
        { status: 404 }
      );
    }

    // No permitir reportar su propia review
    if (review.user.toString() === session.user.id) {
      return NextResponse.json(
        { success: false, error: "No puedes reportar tu propia review" },
        { status: 400 }
      );
    }

    // Verificar si ya reportó esta review
    const alreadyReported = review.reports?.some(
      (report) => report.user.toString() === session.user.id
    );

    if (alreadyReported) {
      return NextResponse.json(
        { success: false, error: "Ya has reportado esta review" },
        { status: 400 }
      );
    }

    // Agregar reporte
    if (!review.reports) {
      review.reports = [];
    }

    review.reports.push({
      user: session.user.id,
      reason,
      createdAt: new Date(),
    });

    // Marcar como reportada si tiene más de 1 reporte
    if (review.reports.length >= 1) {
      review.reported = true;
    }

    await review.save();

    return NextResponse.json({
      success: true,
      message: "Review reportada correctamente",
    });
  } catch (error) {
    console.error("Error reporting review:", error);
    return NextResponse.json(
      { success: false, error: "Error al reportar review" },
      { status: 500 }
    );
  }
}
