// app/api/products/[productId]/reviews/route.js - ACTUALIZADO
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import Order from "@/models/Order";
import { authOptions } from "@/lib/auth";

// Función para verificar si el usuario ha comprado el producto
async function hasUserPurchasedProduct(userId, productId) {
  const order = await Order.findOne({
    user: userId,
    "items.product": productId,
    status: { $in: ["pagado", "enviado", "entregado"] },
  });

  return !!order;
}

// GET - Obtener todas las reviews de un producto (separadas por tipo)
export async function GET(request, { params }) {
  try {
    const awaitedParams = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "question", "rating", o sin especificar para ambos

    await connectDB();

    let query = { product: awaitedParams.productId };

    // Filtrar por tipo si se especifica
    if (type && ["question", "rating"].includes(type)) {
      query.type = type;
    }

    const reviews = await Review.find(query)
      .populate("user", "name")
      .sort({ createdAt: -1 });

    // Separar por tipo para estadísticas
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
      reviews: type ? reviews : { questions, ratings }, // Devolver separado si no se especifica tipo
      ratingStats,
      counts: {
        questions: questions.length,
        ratings: ratings.length,
        total: reviews.length,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las reseñas" },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva pregunta o calificación
export async function POST(request, { params }) {
  try {
    const awaitedParams = await params;
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

    // Validaciones según el tipo
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

    // Verificar si el usuario ya ha dejado este tipo de interacción para este producto
    const existingReview = await Review.findOne({
      product: awaitedParams.productId,
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

    // Verificar si el producto existe
    const product = await Product.findById(awaitedParams.productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar permisos según el tipo
    const hasPurchased = await hasUserPurchasedProduct(
      session.user.id,
      awaitedParams.productId
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

    // Para preguntas, cualquier usuario autenticado puede escribir
    // (no se requiere haber comprado el producto)

    // Crear la nueva review/pregunta
    const reviewData = {
      product: awaitedParams.productId,
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

    // Poblar la información del usuario
    await review.populate("user", "name");

    return NextResponse.json({
      success: true,
      review,
      message:
        type === "rating"
          ? "Calificación enviada con éxito"
          : "Pregunta enviada con éxito",
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: "Error al enviar la interacción" },
      { status: 500 }
    );
  }
}
