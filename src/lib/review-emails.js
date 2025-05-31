// lib/review-emails.js - Sistema de emails para reviews
"use server";

import nodemailer from "nodemailer";
import { ReviewCacheService } from "./cache";

// Función para obtener la URL base normalizada
function getBaseUrl() {
  const url = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

// Crear transportador de email
async function createEmailTransporter() {
  if (process.env.NODE_ENV === "development") {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransporter({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      tls: { rejectUnauthorized: false },
    });
  }

  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: process.env.NODE_ENV === "production" },
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

// EMAIL 1: Notificar al usuario que su pregunta fue respondida
export async function sendQuestionAnsweredEmail(question, product, user) {
  try {
    const transporter = await createEmailTransporter();
    const baseUrl = getBaseUrl();
    const logoUrl =
      "https://indumentaria-soffy.vercel.app/_next/image?url=%2Fimages%2Flogo.jpeg&w=96&q=75";
    const productUrl = `${baseUrl}/products/${product._id}#reviews-section`;

    const info = await transporter.sendMail({
      from: `"IndumentariaSoffy" <${
        process.env.EMAIL_USER || "indumentariasoffy@gmail.com"
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
                    <img src="${product.imageUrl}" alt="${
        product.title
      }" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                    <div>
                      <h4 style="margin: 0 0 5px 0; color: #1a1a1a;">${
                        product.title
                      }</h4>
                      <p style="margin: 0; color: #10b981; font-weight: 600; font-size: 18px;">${formatPrice(
                        product.salePrice
                      )}</p>
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
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        "Email de pregunta respondida:",
        nodemailer.getTestMessageUrl(info)
      );
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error enviando email de pregunta respondida:", error);
    return { success: false, error: error.message };
  }
}

// EMAIL 2: Solicitar review después de compra (seguimiento)
export async function sendReviewRequestEmail(
  order,
  user,
  daysAfterDelivery = 3
) {
  try {
    const transporter = await createEmailTransporter();
    const baseUrl = getBaseUrl();
    const logoUrl =
      "https://indumentaria-soffy.vercel.app/_next/image?url=%2Fimages%2Flogo.jpeg&w=96&q=75";

    // Generar enlaces directos a cada producto para calificar
    const productLinks = order.items.map(
      (item) => `${baseUrl}/products/${item.product}#reviews-section`
    );

    const info = await transporter.sendMail({
      from: `"IndumentariaSoffy" <${
        process.env.EMAIL_USER || "indumentariasoffy@gmail.com"
      }>`,
      to: user.email,
      subject: `⭐ ¿Qué te parecieron tus productos? - Califica tu compra`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Califica tu Compra</title>
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
                  <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">
                    ¿Qué te parecieron tus productos?
                  </h1>
                  <p style="color: #666; margin: 0; font-size: 16px;">
                    Hola <strong>${
                      user.name
                    }</strong>, esperamos que estés disfrutando tu compra
                  </p>
                </div>

                <!-- Productos comprados -->
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                  <h3 style="color: #1a1a1a; margin: 0 0 20px 0;">Productos que compraste:</h3>
                  ${order.items
                    .map(
                      (item, index) => `
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; padding-bottom: 15px; ${
                      index < order.items.length - 1
                        ? "border-bottom: 1px solid #e5e5e5;"
                        : ""
                    }">
                      <img src="${item.imageUrl}" alt="${
                        item.title
                      }" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                      <div style="flex: 1;">
                        <h4 style="margin: 0 0 5px 0; color: #1a1a1a; font-size: 14px;">${
                          item.title
                        }</h4>
                        <p style="margin: 0; color: #666; font-size: 12px;">Cantidad: ${
                          item.quantity
                        }</p>
                      </div>
                      <a href="${baseUrl}/products/${
                        item.product
                      }#reviews-section" 
                         style="background-color: #f59e0b; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600;">
                        ⭐ Calificar
                      </a>
                    </div>
                  `
                    )
                    .join("")}
                </div>
                
                <!-- Por qué tu opinión importa -->
                <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px;">
                  <h3 style="color: #1e40af; margin: 0 0 15px 0;">¿Por qué tu opinión es importante?</h3>
                  <ul style="color: #1e3a8a; margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Ayudas a otros clientes a tomar mejores decisiones</li>
                    <li style="margin-bottom: 8px;">Nos permite mejorar nuestros productos y servicio</li>
                    <li style="margin-bottom: 8px;">Solo toma 2 minutos y es muy valioso para nosotros</li>
                  </ul>
                </div>
                
                <!-- Call to Action Principal -->
                <div style="text-align: center; margin-bottom: 30px;">
                  <h3 style="color: #1a1a1a; margin: 0 0 15px 0;">¡Califica tu experiencia!</h3>
                  <a href="${productLinks[0]}" 
                     style="display: inline-block; background-color: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 18px;">
                    ⭐⭐⭐⭐⭐ Calificar Productos
                  </a>
                </div>

                <!-- Incentivo adicional -->
                <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; text-align: center;">
                  <h3 style="color: #065f46; margin: 0 0 10px 0;">🎁 Beneficio especial</h3>
                  <p style="color: #065f46; margin: 0; font-size: 14px;">
                    Los clientes que dejan reviews reciben un <strong>10% de descuento</strong> en su próxima compra
                  </p>
                </div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #f7f7f7; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0 0 15px 0; color: #10b981; font-weight: 600;">¡Gracias por confiar en IndumentariaSoffy!</p>
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #999;">
                  © ${new Date().getFullYear()} IndumentariaSoffy. Todos los derechos reservados.
                </p>
                <a href="https://www.instagram.com/indumentaria_soffy" style="margin: 0 10px;">
                  <img src="https://i.ibb.co/NNwdYSF/instagram-icon.png" alt="Instagram" width="20" height="20">
                </a>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        "Email de solicitud de review:",
        nodemailer.getTestMessageUrl(info)
      );
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error enviando email de solicitud de review:", error);
    return { success: false, error: error.message };
  }
}

// EMAIL 3: Notificar al admin sobre nueva pregunta
export async function sendNewQuestionNotificationToAdmin(
  question,
  product,
  user
) {
  try {
    const transporter = await createEmailTransporter();
    const baseUrl = getBaseUrl();
    const adminUrl = `${baseUrl}/admin/reviews`;

    const info = await transporter.sendMail({
      from: `"IndumentariaSoffy Sistema" <${
        process.env.EMAIL_USER || "indumentariasoffy@gmail.com"
      }>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `❓ Nueva pregunta sobre "${product.title}"`,
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
            
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #3b82f6; color: white;">
                <h1 style="margin: 0; font-size: 24px;">❓ NUEVA PREGUNTA RECIBIDA</h1>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 30px;">
                <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="margin: 0; color: #1e40af; text-align: center;">Producto: ${
                    product.title
                  }</h2>
                </div>
                
                <h3>👤 Cliente:</h3>
                <table width="100%" style="margin-bottom: 20px;">
                  <tr><td><strong>Nombre:</strong></td><td>${
                    user.name
                  }</td></tr>
                  <tr><td><strong>Email:</strong></td><td>${
                    user.email
                  }</td></tr>
                  <tr><td><strong>Verificado:</strong></td><td>${
                    question.verified
                      ? "✅ Sí (Cliente que compró)"
                      : "❌ No ha comprado aún"
                  }</td></tr>
                </table>
                
                <h3>❓ Pregunta:</h3>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 0; font-size: 16px; color: #1a1a1a;">"${
                    question.comment
                  }"</p>
                </div>
                
                <h3>📦 Producto:</h3>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
                  <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${product.imageUrl}" alt="${
        product.title
      }" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                    <div>
                      <h4 style="margin: 0 0 5px 0;">${product.title}</h4>
                      <p style="margin: 0; color: #10b981; font-weight: 600;">${formatPrice(
                        product.salePrice
                      )}</p>
                    </div>
                  </div>
                </div>
                
                <div style="text-align: center;">
                  <a href="${adminUrl}" 
                     style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    RESPONDER EN ADMIN PANEL
                  </a>
                </div>
                
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
                  <p style="margin: 0; color: #92400e;">
                    <strong>⏰ Acción requerida:</strong> 
                    Un cliente está esperando tu respuesta. Responder rápido mejora la experiencia de compra.
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        "Email de nueva pregunta (admin):",
        nodemailer.getTestMessageUrl(info)
      );
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      "Error enviando notificación de nueva pregunta al admin:",
      error
    );
    return { success: false, error: error.message };
  }
}

// EMAIL 4: Resumen semanal de reviews para admin
export async function sendWeeklyReviewSummaryToAdmin(stats) {
  try {
    const transporter = await createEmailTransporter();
    const baseUrl = getBaseUrl();
    const analyticsUrl = `${baseUrl}/admin/analytics`;

    const info = await transporter.sendMail({
      from: `"IndumentariaSoffy Analytics" <${
        process.env.EMAIL_USER || "indumentariasoffy@gmail.com"
      }>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `📊 Resumen Semanal de Reviews - ${stats.totalReviews} nuevas interacciones`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resumen Semanal</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f7f7;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #1f2937; color: white;">
                <h1 style="margin: 0; font-size: 24px;">📊 RESUMEN SEMANAL DE REVIEWS</h1>
                <p style="margin: 10px 0 0 0;">Semana del ${formatDate(
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                )} al ${formatDate(new Date())}</p>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 30px;">
                <!-- Métricas principales -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px;">
                  <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #1e40af;">${
                      stats.totalReviews
                    }</div>
                    <div style="color: #1e40af; font-weight: 600;">Total Reviews</div>
                  </div>
                  
                  <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #166534;">${
                      stats.newQuestions
                    }</div>
                    <div style="color: #166534; font-weight: 600;">Nuevas Preguntas</div>
                  </div>
                  
                  <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #92400e;">${
                      stats.newRatings
                    }</div>
                    <div style="color: #92400e; font-weight: 600;">Nuevas Calificaciones</div>
                  </div>
                  
                  <div style="background-color: #f3e8ff; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #7c3aed;">${stats.averageRating.toFixed(
                      1
                    )}</div>
                    <div style="color: #7c3aed; font-weight: 600;">Rating Promedio</div>
                  </div>
                </div>

                <!-- Productos destacados -->
                <h3 style="color: #1a1a1a; margin-bottom: 15px;">🏆 Productos Más Comentados Esta Semana:</h3>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                  ${stats.topProducts
                    .slice(0, 3)
                    .map(
                      (product, index) => `
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: ${
                      index < 2 ? "15px" : "0"
                    }; padding-bottom: ${index < 2 ? "15px" : "0"}; ${
                        index < 2 ? "border-bottom: 1px solid #e5e5e5;" : ""
                      }">
                      <div style="width: 30px; height: 30px; background-color: #f59e0b; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${index + 1}
                      </div>
                      <img src="${product.imageUrl}" alt="${
                        product.title
                      }" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                      <div style="flex: 1;">
                        <h4 style="margin: 0 0 5px 0; font-size: 14px;">${
                          product.title
                        }</h4>
                        <div style="color: #666; font-size: 12px;">
                          ${
                            product.reviewCount
                          } reviews • ⭐ ${product.averageRating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  `
                    )
                    .join("")}
                </div>

                <!-- Acciones pendientes -->
                ${
                  stats.pendingQuestions > 0
                    ? `
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 20px;">
                  <h3 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Atención Requerida</h3>
                  <p style="color: #dc2626; margin: 0;">
                    Tienes <strong>${stats.pendingQuestions} preguntas sin responder</strong>. 
                    Los clientes esperan respuestas rápidas para mejorar su experiencia de compra.
                  </p>
                </div>
                `
                    : ""
                }

                <!-- Call to Action -->
                <div style="text-align: center;">
                  <a href="${analyticsUrl}" 
                     style="display: inline-block; background-color: #1f2937; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    VER ANALYTICS COMPLETO
                  </a>
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        "Email de resumen semanal:",
        nodemailer.getTestMessageUrl(info)
      );
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error enviando resumen semanal:", error);
    return { success: false, error: error.message };
  }
}

// Función para programar emails de seguimiento
export async function scheduleReviewFollowUp(
  orderId,
  userId,
  daysAfterDelivery = 3
) {
  try {
    // En una implementación real, usarías un job queue como Bull o Agenda
    // Por ahora, simularemos con setTimeout (no recomendado para producción)

    const delay = daysAfterDelivery * 24 * 60 * 60 * 1000; // convertir días a ms

    // Cachear la información para el email
    await ReviewCacheService.set(
      `scheduled_email:${orderId}`,
      { orderId, userId, type: "review_request" },
      delay / 1000 // TTL en segundos
    );

    console.log(
      `📧 Email de seguimiento programado para ${daysAfterDelivery} días: Order ${orderId}`
    );

    return { success: true };
  } catch (error) {
    console.error("Error programando email de seguimiento:", error);
    return { success: false, error: error.message };
  }
}
