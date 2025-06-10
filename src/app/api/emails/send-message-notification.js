// /pages/api/emails/send-message-notification.js
import { sendMessageNotification } from "@/lib/emailService";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const messageData = req.body;

    const result = await sendMessageNotification(messageData);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Notificación enviada exitosamente",
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error en API de mensaje:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
