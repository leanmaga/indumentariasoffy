// src/app/api/admin/questions/route.js
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
        _id: question.user?._id,
        name: question.user?.name,
        email: question.user?.email,
      },
      product: {
        _id: question.product?._id,
        title: question.product?.title,
        imageUrl: question.product?.imageUrl,
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
