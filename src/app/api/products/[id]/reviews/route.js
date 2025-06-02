// src/app/api/products/[id]/reviews/route.js - VERSIÓN CORREGIDA Y COMPLETA
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import Order from "@/models/Order";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import { sendNewQuestionNotificationToAdmin } from "@/lib/review-emails";

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
    console.error("Error checking purchase:", error);
    return false;
  }
}

// GET - Obtener todas las reviews de un producto
export async function GET(request, { params }) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Obtener todas las reviews del producto
    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    // Separar por tipo
    const questions = reviews.filter((r) => r.type === "question");
    const ratings = reviews.filter((r) => r.type === "rating");

    // Calcular estadísticas de ratings
    let ratingStats = {
      average: 0,
      total: 0,
      distribution: [0, 0, 0, 0, 0],
    };

    if (ratings.length > 0) {
      const distribution = [0, 0, 0, 0, 0];
      let total = 0;

      ratings.forEach((review) => {
        distribution[review.rating - 1]++;
        total += review.rating;
      });

      ratingStats = {
        average: total / ratings.length,
        total: ratings.length,
        distribution,
      };
    }

    return NextResponse.json({
      success: true,
      reviews: { questions, ratings },
      ratingStats,
      counts: {
        questions: questions.length,
        ratings: ratings.length,
        total: reviews.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener las reseñas: " + error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva pregunta o calificación
export async function POST(request, { params }) {
  try {
    const { id: productId } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión para interactuar" },
        { status: 401 }
      );
    }

    await connectDB();

    const { type, rating, comment } = await request.json();

    // Validar tipo
    if (!type || !["question", "rating"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Tipo de interacción inválido" },
        { status: 400 }
      );
    }

    // Validaciones específicas
    if (type === "rating") {
      if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json(
          { success: false, error: "La calificación debe estar entre 1 y 5" },
          { status: 400 }
        );
      }
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "El comentario debe tener al menos 10 caracteres",
        },
        { status: 400 }
      );
    }

    // Verificar si ya existe este tipo de interacción
    const existingReview = await Review.findOne({
      product: productId,
      user: session.user.id,
      type: type,
    });

    if (existingReview) {
      const message =
        type === "rating"
          ? "Ya has dejado una calificación para este producto"
          : "Ya has dejado una pregunta para este producto";

      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Obtener info del usuario
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar permisos de compra para calificaciones
    const hasPurchased = await hasUserPurchasedProduct(
      session.user.id,
      productId
    );
    // SOLO para calificaciones con estrellas requerir compra
    if (type === "rating" && !hasPurchased) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Solo los clientes que han comprado este producto pueden dejarlo una calificación con estrellas",
        },
        { status: 403 }
      );
    }

    // Crear la nueva review/pregunta
    const reviewData = {
      product: productId,
      user: session.user.id,
      type: type,
      comment: comment.trim(),
      verified: hasPurchased,
    };

    // Solo agregar rating si es tipo "rating"
    if (type === "rating") {
      reviewData.rating = parseInt(rating);
    }

    const review = await Review.create(reviewData);
    await review.populate("user", "name");

    // 🆕 ENVIAR NOTIFICACIÓN AL ADMIN SI ES UNA PREGUNTA
    if (type === "question") {
      try {
        const emailResult = await sendNewQuestionNotificationToAdmin(
          review,
          product,
          user
        );
      } catch (emailError) {
        console.error("❌ Error enviando notificación:", emailError);
        // No fallar la creación de la pregunta por error de email
      }
    }

    return NextResponse.json({
      success: true,
      review,
      message:
        type === "rating"
          ? "Calificación enviada con éxito"
          : "Pregunta enviada con éxito. Recibirás una notificación cuando sea respondida.",
    });
  } catch (error) {
    console.error("❌ Error creating review:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al enviar la interacción: " + error.message,
      },
      { status: 500 }
    );
  }
}
