// /pages/api/reviews/[reviewId]/respond.js

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { sendMessageNotification } from "@/lib/emailService";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    // Verificar que sea admin
    if (!session || session.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { reviewId } = req.query;
    const { response } = req.body;

    if (!response || response.trim().length < 10) {
      return res.status(400).json({
        error: "La respuesta debe tener al menos 10 caracteres",
      });
    }

    await connectDB();

    // Buscar la pregunta
    const question = await Review.findById(reviewId)
      .populate("user", "name email")
      .populate("product", "name images");

    if (!question) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }

    if (question.type !== "question") {
      return res
        .status(400)
        .json({ error: "Solo se pueden responder preguntas" });
    }

    if (question.response) {
      return res.status(400).json({ error: "Esta pregunta ya fue respondida" });
    }

    // Actualizar la pregunta con la respuesta
    question.response = response.trim();
    question.responseDate = new Date();
    await question.save();

    // Enviar notificación por email al usuario
    try {
      const emailData = {
        senderName: "Administrador",
        recipientName: question.user.name,
        recipientEmail: question.user.email,
        productId: question.product._id,
        productName: question.product.name,
        productImage: question.product.images?.[0] || "/placeholder.jpg",
        message: response.trim(),
        messageType: "answer",
      };

      await sendMessageNotification(emailData);
    } catch (emailError) {
      console.error("Error al enviar email de respuesta:", emailError);
      // No fallamos la respuesta si el email falla
    }

    return res.status(200).json({
      success: true,
      message: "Respuesta enviada exitosamente",
    });
  } catch (error) {
    console.error("Error responding to question:", error);
    return res.status(500).json({ error: "Error al enviar la respuesta" });
  }
}
