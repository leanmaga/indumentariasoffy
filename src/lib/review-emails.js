// lib/review-emails.js - VERSIÓN COMPLETA
"use server";

import nodemailer from "nodemailer";

// Función para obtener la URL base normalizada
function getBaseUrl() {
  const url = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

// Función para crear el transportador de email
async function createEmailTransport() {
  if (process.env.NODE_ENV === "production") {
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
}

// Función para formatear precio
const formatPrice = (price) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price);
};

// Función para formatear fecha
const formatDate = (date) => {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(date));
};

// EMAIL 1: Notificar al admin cuando alguien hace una pregunta
export async function sendNewQuestionNotificationToAdmin(
  question,
  product,
  user
) {
  try {
    const transporter = await createEmailTransport();
    const baseUrl = getBaseUrl();
    const logoUrl =
      "https://indumentaria-soffy.vercel.app/_next/image?url=%2Fimages%2Flogo.jpeg&w=96&q=75";

    // URL directa para responder en el panel de admin
    const adminResponseUrl = `${baseUrl}/admin/questions`;
    const productUrl = `${baseUrl}/products/${product._id}`;

    const info = await transporter.sendMail({
      from: `"IndumentariaSoffy Sistema" <${
        process.env.EMAIL_USER || "sofiaballesta1424@gmail.com"
      }>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `❓ Nueva pregunta sobre "${product.title}" de ${user.name}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nueva Pregunta</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f7f7;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header -->
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #3b82f6; color: white;">
                <h1 style="margin: 0; font-size: 24px;">❓ NUEVA PREGUNTA RECIBIDA</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 30px;">
                <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                  <h2 style="margin: 0; color: #1e40af;">Pregunta sobre: ${
                    product.title
                  }</h2>
                </div>
                
                <!-- Información del cliente -->
                <h3>👤 Información del Cliente:</h3>
                <table width="100%" style="margin-bottom: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
                  <tr><td style="padding: 5px 0;"><strong>Nombre:</strong></td><td>${
                    user.name
                  }</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Email:</strong></td><td>${
                    user.email
                  }</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Teléfono:</strong></td><td>${
                    user.phone || "No proporcionado"
                  }</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Fecha:</strong></td><td>${formatDate(
                    question.createdAt
                  )}</td></tr>
                </table>
                
                <!-- Producto consultado -->
                <h3>📦 Producto Consultado:</h3>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${product.imageUrl}" alt="${product.title}" 
                         style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                    <div>
                      <h4 style="margin: 0 0 10px 0; color: #1a1a1a;">${
                        product.title
                      }</h4>
                      <p style="margin: 0; color: #10b981; font-weight: 600; font-size: 18px;">
                        ${formatPrice(product.salePrice)}
                      </p>
                      <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
                        Categoría: ${product.category}
                      </p>
                      <a href="${productUrl}" style="color: #3b82f6; font-size: 14px; text-decoration: none;">
                        Ver producto →
                      </a>
                    </div>
                  </div>
                </div>
                
                <!-- La pregunta -->
                <h3>❓ Pregunta del Cliente:</h3>
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px;">
                  <p style="margin: 0; color: #92400e; font-size: 16px; line-height: 1.6; font-style: italic;">
                    "${question.comment}"
                  </p>
                </div>
                
                <!-- Botones de acción -->
                <div style="text-align: center; margin-bottom: 30px;">
                  <a href="${adminResponseUrl}" 
                     style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 10px;">
                    RESPONDER EN ADMIN
                  </a>
                  <a href="https://wa.me/5491126907696?text=${encodeURIComponent(
                    `Hola ${user.name}, sobre tu pregunta de "${product.title}": ${question.comment}`
                  )}" 
                     style="display: inline-block; background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    RESPONDER POR WHATSAPP
                  </a>
                </div>
                
                <!-- Información adicional -->
                <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
                  <h4 style="color: #1e40af; margin: 0 0 10px 0;">📋 Información adicional:</h4>
                  <ul style="color: #1e3a8a; margin: 0; padding-left: 20px;">
                    <li>Cliente ${
                      question.verified
                        ? "verificado (ha comprado antes)"
                        : "nuevo"
                    }</li>
                    <li>ID de pregunta: ${question._id}</li>
                    <li>Responde pronto para mantener buena reputación</li>
                    <li>El cliente recibirá un email automático cuando respondas</li>
                  </ul>
                </div>
                
                <!-- Estadísticas -->
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    💬 <strong>Tip:</strong> Responder rápido mejora la confianza del cliente y puede generar más ventas
                  </p>
                </div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #f7f7f7; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                  Panel de administración: <a href="${baseUrl}/admin" style="color: #3b82f6;">IndumentariaSoffy Admin</a>
                </p>
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  Email automático del sistema de preguntas y respuestas
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      "Error enviando notificación de nueva pregunta al admin:",
      error
    );
    return { success: false, error: error.message };
  }
}

// EMAIL 2: Notificar al usuario que su pregunta fue respondida
export async function sendQuestionAnsweredEmail(question, product, user) {
  try {
    const transporter = await createEmailTransport();
    const baseUrl = getBaseUrl();
    const logoUrl =
      "https://indumentaria-soffy.vercel.app/_next/image?url=%2Fimages%2Flogo.jpeg&w=96&q=75";
    const productUrl = `${baseUrl}/products/${product._id}#reviews-section`;

    const info = await transporter.sendMail({
      from: `"IndumentariaSoffy" <${
        process.env.EMAIL_USER || "sofiaballesta1424@gmail.com"
      }>`,
      to: user.email,
      subject: `✅ Tu pregunta sobre "${product.title}" fue respondida`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pregunta Respondida</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f7f7;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header -->
            <tr>
              <td style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                <img src="${logoUrl}" alt="IndumentariaSoffy Logo" width="120">
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <span style="color: white; font-size: 40px;">✓</span>
                  </div>
                  <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #10b981;">
                    ¡Tu Pregunta Fue Respondida!
                  </h1>
                  <p style="color: #666; margin: 0;">
                    Hola <strong>${
                      user.name
                    }</strong>, tenemos una respuesta para ti
                  </p>
                </div>

                <!-- Producto -->
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                  <h3 style="color: #1a1a1a; margin: 0 0 15px 0;">Producto consultado:</h3>
                  <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${product.imageUrl}" alt="${product.title}" 
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                    <div>
                      <h4 style="margin: 0 0 5px 0; color: #1a1a1a;">${
                        product.title
                      }</h4>
                      <p style="margin: 0; color: #10b981; font-weight: 600; font-size: 18px;">
                        ${formatPrice(product.salePrice)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- Tu pregunta -->
                <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 20px;">
                  <h3 style="color: #1e40af; margin: 0 0 10px 0;">Tu pregunta:</h3>
                  <p style="color: #1e3a8a; margin: 0; font-style: italic;">"${
                    question.comment
                  }"</p>
                  <p style="color: #64748b; margin: 10px 0 0 0; font-size: 12px;">
                    Preguntado el ${formatDate(question.createdAt)}
                  </p>
                </div>
                
                <!-- Respuesta -->
                <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 30px;">
                  <h3 style="color: #047857; margin: 0 0 10px 0;">Nuestra respuesta:</h3>
                  <p style="color: #065f46; margin: 0; font-weight: 500;">${
                    question.response
                  }</p>
                  <p style="color: #64748b; margin: 10px 0 0 0; font-size: 12px;">
                    Respondido el ${formatDate(question.responseDate)}
                  </p>
                </div>
                
                <!-- Call to Action -->
                <div style="text-align: center; margin-bottom: 30px;">
                  <a href="${productUrl}" 
                     style="display: inline-block; background-color: #000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-right: 10px;">
                    Ver Producto
                  </a>
                  <a href="https://wa.me/5491126907696" 
                     style="display: inline-block; background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    Contactar por WhatsApp
                  </a>
                </div>

                <!-- ¿Te gustó la respuesta? -->
                <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; text-align: center;">
                  <h3 style="color: #92400e; margin: 0 0 10px 0;">¿Te gustó nuestra respuesta?</h3>
                  <p style="color: #92400e; margin: 0 0 15px 0; font-size: 14px;">
                    Ayuda a otros clientes marcándola como útil en la página del producto
                  </p>
                  <a href="${productUrl}" 
                     style="display: inline-block; background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    Marcar como Útil
                  </a>
                </div>

                <!-- Invitación a comprar -->
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center;">
                  <h3 style="color: #15803d; margin: 0 0 10px 0;">¿Resolvimos tu duda?</h3>
                  <p style="color: #166534; margin: 0 0 15px 0; font-size: 14px;">
                    Si estás listo para comprar, te ofrecemos envío gratis y pago seguro
                  </p>
                  <a href="${productUrl}" 
                     style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    🛒 Comprar Ahora
                  </a>
                </div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #f7f7f7; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #999;">
                  © ${new Date().getFullYear()} IndumentariaSoffy. Todos los derechos reservados.
                </p>
                <a href="https://www.instagram.com/indumentaria_soffy" style="margin: 0 10px;">
                  <img src="https://i.ibb.co/NNwdYSF/instagram-icon.png" alt="Instagram" width="20" height="20">
                </a>
                <p style="margin: 20px 0 0 0; font-size: 12px; color: #999;">
                  ¿Tienes más preguntas? Contáctanos en 
                  <a href="mailto:sofiaballesta1424@gmail.com" style="color: #000;">sofiaballesta1424@gmail.com</a>
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error enviando email de pregunta respondida:", error);
    return { success: false, error: error.message };
  }
}
