// 4. API Routes
// /pages/api/emails/send-order-confirmation.js
import {
  sendOrderConfirmation,
  sendAdminOrderNotification,
} from "@/lib/emailService";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const orderData = req.body;

    // Enviar email al usuario
    const userEmailResult = await sendOrderConfirmation(orderData);

    // Enviar email al administrador
    const adminEmailResult = await sendAdminOrderNotification(orderData);

    if (userEmailResult.success && adminEmailResult.success) {
      return res.status(200).json({
        success: true,
        message: "Emails enviados exitosamente",
      });
    } else {
      throw new Error("Error al enviar uno o más emails");
    }
  } catch (error) {
    console.error("Error en API de emails:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
