// app/api/messages/unread-count/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    await connectDB();

    if (session.user.role === "admin") {
      // Para admin: contar preguntas sin responder
      const pendingQuestions = await Review.countDocuments({
        type: "question",
        response: { $in: [null, "", undefined] },
      });

      return NextResponse.json({
        success: true,
        pendingQuestions,
        totalQuestions: await Review.countDocuments({ type: "question" }),
      });
    } else {
      // Para usuarios: contar respuestas no leídas
      const userQuestions = await Review.find({
        user: session.user.id,
        type: "question",
        response: { $ne: "" },
      });

      // Por simplicidad, consideramos "no leída" si la respuesta es reciente
      const unreadResponses = userQuestions.filter(
        (q) =>
          q.responseDate &&
          new Date(q.responseDate) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 días
      ).length;

      return NextResponse.json({
        success: true,
        unreadResponses,
        totalQuestions: userQuestions.length,
      });
    }
  } catch (error) {
    console.error("Error getting unread count:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener conteo" },
      { status: 500 }
    );
  }
}

// ================================================================
// app/api/messages/user/route.js - Mensajes del usuario
// ================================================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    await connectDB();

    // Obtener todas las preguntas del usuario con información del producto
    const userQuestions = await Review.find({
      user: session.user.id,
      type: "question",
    })
      .populate("product", "title imageUrl")
      .sort({ createdAt: -1 });

    const formattedQuestions = userQuestions.map((question) => ({
      _id: question._id,
      comment: question.comment,
      createdAt: question.createdAt,
      response: question.response,
      responseDate: question.responseDate,
      helpful: question.helpful,
      product: {
        _id: question.product._id,
        title: question.product.title,
        imageUrl: question.product.imageUrl,
      },
      status: question.response ? "answered" : "pending",
    }));

    return NextResponse.json({
      success: true,
      questions: formattedQuestions,
      stats: {
        total: formattedQuestions.length,
        pending: formattedQuestions.filter((q) => q.status === "pending")
          .length,
        answered: formattedQuestions.filter((q) => q.status === "answered")
          .length,
      },
    });
  } catch (error) {
    console.error("Error getting user messages:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener mensajes" },
      { status: 500 }
    );
  }
}

// ================================================================
// app/api/admin/questions/route.js - Preguntas para admin
// ================================================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all"; // all, pending, answered
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    await connectDB();

    let filter = { type: "question" };

    if (status === "pending") {
      filter.response = { $in: [null, "", undefined] };
    } else if (status === "answered") {
      filter.response = { $ne: "" };
    }

    const questions = await Review.find(filter)
      .populate("user", "name email")
      .populate("product", "title imageUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Review.countDocuments(filter);

    const formattedQuestions = questions.map((question) => ({
      _id: question._id,
      comment: question.comment,
      createdAt: question.createdAt,
      response: question.response,
      responseDate: question.responseDate,
      helpful: question.helpful,
      verified: question.verified,
      user: {
        _id: question.user._id,
        name: question.user.name,
        email: question.user.email,
      },
      product: {
        _id: question.product._id,
        title: question.product.title,
        imageUrl: question.product.imageUrl,
      },
      status: question.response ? "answered" : "pending",
      priority: question.verified ? "high" : "normal",
    }));

    return NextResponse.json({
      success: true,
      questions: formattedQuestions,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
      },
      stats: {
        total: await Review.countDocuments({ type: "question" }),
        pending: await Review.countDocuments({
          type: "question",
          response: { $in: [null, "", undefined] },
        }),
        answered: await Review.countDocuments({
          type: "question",
          response: { $ne: "" },
        }),
      },
    });
  } catch (error) {
    console.error("Error getting admin questions:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener preguntas" },
      { status: 500 }
    );
  }
}

// ================================================================
// app/api/admin/questions/[questionId]/respond/route.js
// ================================================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";
import Product from "@/models/Product";
import { authOptions } from "@/lib/auth";
import { sendQuestionAnsweredEmail } from "@/lib/review-emails";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 403 }
      );
    }

    const { questionId } = await params;
    const { response } = await request.json();

    if (!response || response.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "La respuesta debe tener al menos 10 caracteres",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const question = await Review.findById(questionId)
      .populate("user", "name email")
      .populate("product", "title imageUrl");

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Pregunta no encontrada" },
        { status: 404 }
      );
    }

    if (question.type !== "question") {
      return NextResponse.json(
        { success: false, error: "Solo se pueden responder preguntas" },
        { status: 400 }
      );
    }

    // Actualizar la pregunta con la respuesta
    question.response = response.trim();
    question.responseDate = new Date();
    await question.save();

    // Enviar email de notificación al usuario (opcional)
    try {
      await sendQuestionAnsweredEmail(
        question,
        question.product,
        question.user
      );
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // No fallar la operación por error de email
    }

    return NextResponse.json({
      success: true,
      message: "Respuesta enviada con éxito",
      question: {
        _id: question._id,
        response: question.response,
        responseDate: question.responseDate,
      },
    });
  } catch (error) {
    console.error("Error responding to question:", error);
    return NextResponse.json(
      { success: false, error: "Error al enviar respuesta" },
      { status: 500 }
    );
  }
}
