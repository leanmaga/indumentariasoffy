// lib/email-config.js - NUEVA CONFIGURACIÓN ROBUSTA PARA EMAILS
import nodemailer from "nodemailer";

// Función mejorada para crear transportador de email
export async function createEmailTransporter() {
  try {
    // Verificar variables de entorno necesarias
    const requiredEnvVars = {
      EMAIL_SERVICE: process.env.EMAIL_SERVICE,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS,
    };

    // Si estamos en desarrollo y no hay configuración, usar Ethereal
    if (process.env.NODE_ENV !== "production") {
      if (!requiredEnvVars.EMAIL_USER || !requiredEnvVars.EMAIL_PASS) {
        // Crear cuenta de prueba de Ethereal
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
    }

    // Configuración para producción
    if (!requiredEnvVars.EMAIL_USER || !requiredEnvVars.EMAIL_PASS) {
      throw new Error("❌ Variables de entorno de email faltantes");
    }

    // Configuraciones por servicio
    const transportConfig = {
      auth: {
        user: requiredEnvVars.EMAIL_USER,
        pass: requiredEnvVars.EMAIL_PASS,
      },
    };

    // Configurar según el servicio
    switch (requiredEnvVars.EMAIL_SERVICE?.toLowerCase()) {
      case "gmail":
        return nodemailer.createTransport({
          service: "gmail",
          ...transportConfig,
          tls: {
            rejectUnauthorized: false,
          },
        });

      case "outlook":
      case "hotmail":
        return nodemailer.createTransport({
          service: "hotmail",
          ...transportConfig,
        });

      case "smtp":
        // Configuración SMTP personalizada
        return nodemailer.createTransport({
          host: process.env.EMAIL_HOST || "smtp.gmail.com",
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: process.env.EMAIL_PORT === "465",
          ...transportConfig,
          tls: {
            rejectUnauthorized: process.env.NODE_ENV === "production",
          },
        });

      default:
        // Fallback a Gmail por defecto
        "📧 Usando Gmail como servicio por defecto";
        return nodemailer.createTransport({
          service: "gmail",
          ...transportConfig,
          tls: {
            rejectUnauthorized: false,
          },
        });
    }
  } catch (error) {
    console.error("❌ Error creando transportador de email:", error);
    throw new Error(`Error configurando email: ${error.message}`);
  }
}

// Función para verificar configuración de email
export async function verifyEmailConfig() {
  try {
    const transporter = await createEmailTransporter();

    // Verificar conexión
    const isConnected = await transporter.verify();

    if (isConnected) {
      return { success: true, message: "Email configurado correctamente" };
    } else {
      throw new Error("No se pudo verificar la conexión");
    }
  } catch (error) {
    console.error("❌ Error verificando configuración de email:", error);
    return {
      success: false,
      error: error.message,
      suggestions: [
        "Verifica que EMAIL_USER y EMAIL_PASS estén configurados",
        "Si usas Gmail, habilita la autenticación de 2 factores y usa una contraseña de aplicación",
        "Verifica que EMAIL_SERVICE esté configurado correctamente (gmail, outlook, smtp)",
      ],
    };
  }
}

// Función helper para enviar emails con retry
export async function sendEmailWithRetry(emailData, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transporter = await createEmailTransporter();

      const info = await transporter.sendMail({
        from: `"IndumentariaSoffy" <${process.env.EMAIL_USER}>`,
        ...emailData,
      });

      // // Log en desarrollo
      // if (process.env.NODE_ENV !== "production") {
      //   // URL de preview para Ethereal
      //   if (info.messageId && info.messageId.includes("ethereal")) {
      //     console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(info));
      //   }
      // }

      return { success: true, messageId: info.messageId, attempt };
    } catch (error) {
      lastError = error;
      console.error(
        `❌ Intento ${attempt}/${maxRetries} falló:`,
        error.message
      );

      // Si no es el último intento, esperar antes de reintentar
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error(
    "❌ Falló el envío de email después de",
    maxRetries,
    "intentos:",
    lastError
  );
  return {
    success: false,
    error: lastError.message,
    attempts: maxRetries,
  };
}
