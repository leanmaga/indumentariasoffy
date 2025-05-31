// app/api/products/[id]/reviews/route.js - RUTA CORREGIDA
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
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
    console.error("Error checking purchase:", error);
    return false;
  }
}

// GET - Obtener todas las reviews de un producto
export async function GET(request, { params }) {
  try {
    console.log("🔍 GET Reviews - Params received:", params);

    const awaitedParams = await params;
    const productId = awaitedParams.id; // Usar 'id' consistentemente

    console.log("📦 Product ID:", productId);

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("✅ Database connected");

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      console.log("❌ Product not found:", productId);
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    console.log("📊 Reviews found:", reviews.length);

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
    console.log("📝 POST Review - Params received:", params);

    const awaitedParams = await params;
    const productId = awaitedParams.id; // Usar 'id' consistentemente

    console.log("📦 Product ID:", productId);

    const session = await getServerSession(authOptions);
    console.log("👤 Session:", session?.user?.id);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión para interactuar" },
        { status: 401 }
      );
    }

    await connectDB();
    console.log("✅ Database connected");

    const { type, rating, comment } = await request.json();
    console.log("📄 Review data:", {
      type,
      rating,
      comment: comment?.substring(0, 50),
    });

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

    // Verificar si el usuario ya ha dejado este tipo de interacción
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

    // Verificar si el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar permisos según el tipo
    const hasPurchased = await hasUserPurchasedProduct(
      session.user.id,
      productId
    );
    console.log("🛒 User has purchased:", hasPurchased);

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

    console.log("💾 Creating review with data:", reviewData);

    const review = await Review.create(reviewData);
    await review.populate("user", "name");

    console.log("✅ Review created successfully:", review._id);

    return NextResponse.json({
      success: true,
      review,
      message:
        type === "rating"
          ? "Calificación enviada con éxito"
          : "Pregunta enviada con éxito",
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
