// app/api/products/[productId]/reviews/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import Order from "@/models/Order";
import authOptions from "@/lib/auth";

// Función para verificar si el usuario ha comprado el producto
async function hasUserPurchasedProduct(userId, productId) {
  const order = await Order.findOne({
    user: userId,
    "items.product": productId,
    status: { $in: ["completed", "delivered"] }, // Solo órdenes completadas/entregadas
  });

  return !!order;
}

// GET - Obtener todas las reviews de un producto
export async function GET(request, { params }) {
  try {
    const awaitedParams = await params;

    await connectDB();

    const reviews = await Review.find({ product: awaitedParams.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las reseñas" },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva review
export async function POST(request, { params }) {
  try {
    const awaitedParams = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión para dejar una reseña" },
        { status: 401 }
      );
    }

    await connectDB();

    const { rating, comment } = await request.json();

    // Validaciones
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "La calificación debe estar entre 1 y 5" },
        { status: 400 }
      );
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

    // Verificar si el usuario ya ha dejado una reseña para este producto
    const existingReview = await Review.findOne({
      product: awaitedParams.productId,
      user: session.user.id,
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya has dejado una reseña para este producto",
        },
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

    // Verificar si el usuario ha comprado el producto
    const hasPurchased = await hasUserPurchasedProduct(
      session.user.id,
      awaitedParams.productId
    );

    if (!hasPurchased) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Solo los clientes que han comprado este producto pueden dejar una reseña",
        },
        { status: 403 }
      );
    }

    // Crear la nueva review con verified = true
    const review = await Review.create({
      product: awaitedParams.productId,
      user: session.user.id,
      rating: parseInt(rating),
      comment: comment.trim(),
      verified: true, // Marcamos como verificada porque el usuario compró el producto
    });

    // Poblar la información del usuario
    await review.populate("user", "name");

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear la reseña" },
      { status: 500 }
    );
  }
}
