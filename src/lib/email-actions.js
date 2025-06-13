"use server";

import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "@/models/User";
import connectDB from "./db";

// Función para obtener la URL base normalizada
function getBaseUrl() {
  // Obtener la URL base de las variables de entorno
  const url = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  // Eliminar slash final si existe
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

// Función para crear un transportador de email
async function createEmailTransporter() {
  // Para desarrollo (pruebas locales)
  if (process.env.NODE_ENV === "production") {
    // Crear cuenta de prueba en Ethereal para desarrollo
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      // Ignorar errores de certificados en desarrollo
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Para producción
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Solo usar en desarrollo o si confías en el servidor
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
}

// Acción del servidor para enviar email de verificación
export async function sendVerificationEmail(email) {
  try {
    await connectDB();

    // Buscar el usuario
    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Si el usuario ya está verificado
    if (user.isVerified) {
      return { success: false, error: "Este correo ya está verificado" };
    }

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Establecer fecha de expiración (24 horas)
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    // Actualizar el usuario con el token
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Crear transportador
    const transporter = await createEmailTransporter();

    // URL de verificación (usando la función getBaseUrl)
    const verificationUrl = `${getBaseUrl()}/auth/verify-email?token=${verificationToken}`;

    // URL del logo
    const logoUrl =
      "https://indumentaria-soffy.vercel.app/_next/image?url=%2Fimages%2Flogo.jpeg&w=96&q=75";

    // Enviar email con diseño mejorado
    const info = await transporter.sendMail({
      from: `"IndumentariaSoffy" <${
        process.env.EMAIL_USER || "sofiaballesta1424@gmail.com"
      }>`,
      to: user.email,
      subject: "Verifica tu cuenta en IndumentariaSoffy",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verificación de Cuenta</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; background-color: #f7f7f7;">
          <!-- Main Container -->
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse;">
            <!-- Header -->
            <tr>
               <td style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                <img src="${logoUrl}" alt="IndumentariaSoffy Logo" width="120" style="display: block; margin: 0 auto;">
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 20px; text-align: center;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 1px;">VERIFICA TU CUENTA</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 30px; text-align: center; color: #666666; font-size: 16px; line-height: 24px;">
                      <p>¡Gracias por registrarte en IndumentariaSoffy! Para completar tu registro y acceder a todas las funcionalidades, por favor verifica tu dirección de correo electrónico.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 30px; text-align: center;">
                      <p style="margin: 0; color: #666666; font-size: 16px; line-height: 24px;">Haz clic en el botón para verificar tu cuenta:</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 30px; text-align: center;">
                      <a href="${verificationUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 15px 45px; border-radius: 2px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">VERIFICAR CUENTA</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 30px; text-align: center; color: #666666; font-size: 14px; line-height: 20px;">
                      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                      <p style="word-break: break-all; color: #999999;">${verificationUrl}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 15px; text-align: center; color: #666666; font-size: 14px; line-height: 20px;">
                      <p style="margin: 0;">Este enlace expirará en 24 horas por razones de seguridad.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #f7f7f7; border-top: 1px solid #e5e5e5;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 20px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; color: #999999;">© ${new Date().getFullYear()} IndumentariaSoffy. Todos los derechos reservados.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 20px; text-align: center;">
                      
                        href="https://www.instagram.com/indumentaria_soffy?igsh=ZWNqemd2aGM0cWNq"
                        style="margin: 0 10px; text-decoration: none;"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                      >
                        <img 
                          src="https://i.ibb.co/NNwdYSF/instagram-icon.png" 
                          alt="Instagram" 
                          width="20" 
                          height="20" 
                          style="display: inline-block; border: 0;" 
                        />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; font-size: 12px; color: #999999;">
                      <p>Si tienes alguna pregunta, contacta con nuestro equipo de soporte en <a href="mailto:sofiaballesta1424@gmail.com" style="color: #000000; text-decoration: none;">sofiaballesta1424@gmail.com</a></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error al enviar email de verificación:", error);
    return { success: false, error: error.message };
  }
}

// Acción del servidor para enviar email de restablecimiento de contraseña
export async function sendPasswordResetEmail(email) {
  try {
    await connectDB();

    // Buscar el usuario
    const user = await User.findOne({ email });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return {
        success: true,
        message: "Si el correo existe, se ha enviado un enlace de recuperación",
      };
    }

    // Si el usuario usa solo Google Auth y no tiene contraseña tradicional
    if (user.googleAuth && !user.password) {
      return {
        success: false,
        error:
          "Esta cuenta usa Google para iniciar sesión, no se puede restablecer la contraseña",
      };
    }

    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Establecer fecha de expiración (1 hora)
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

    // Actualizar el usuario con el token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Crear transportador
    const transporter = await createEmailTransporter();

    // URL de restablecimiento (usando la función getBaseUrl)
    const resetUrl = `${getBaseUrl()}/auth/reset-password/${resetToken}`;

    // URL del logo
    const logoUrl =
      "https://indumentaria-soffy.vercel.app/_next/image?url=%2Fimages%2Flogo.jpeg&w=96&q=75";

    // Enviar email
    const info = await transporter.sendMail({
      from: `"IndumentariaSoffy" <${
        process.env.EMAIL_USER || "indumentariasoffy@gmail.com"
      }>`,
      to: user.email,
      subject: "Restablece tu contraseña",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restablecer Contraseña</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; background-color: #f7f7f7;">
          <!-- Main Container -->
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse;">
            <!-- Header -->
            <tr>
               <td style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                <img src="${logoUrl}" alt="IndumentariaSoffy Logo" width="120" style="display: block; margin: 0 auto;">
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 20px; text-align: center;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 1px;">RESTABLECER CONTRASEÑA</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 30px; text-align: center; color: #666666; font-size: 16px; line-height: 24px;">
                      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si no has realizado esta solicitud, puedes ignorar este mensaje.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 30px; text-align: center;">
                      <p style="margin: 0; color: #666666; font-size: 16px; line-height: 24px;">Haz clic en el botón para crear una nueva contraseña:</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 30px; text-align: center;">
                      <a href="${resetUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 15px 45px; border-radius: 2px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">RESTABLECER</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 30px; text-align: center; color: #666666; font-size: 14px; line-height: 20px;">
                      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                      <p style="word-break: break-all; color: #999999;">${resetUrl}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 15px; text-align: center; color: #666666; font-size: 14px; line-height: 20px;">
                      <p style="margin: 0;">Este enlace expirará en 1 hora por razones de seguridad.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #f7f7f7; border-top: 1px solid #e5e5e5;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 20px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; color: #999999;">© ${new Date().getFullYear()} IndumentariaSoffy. Todos los derechos reservados.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 20px; text-align: center;">
                      
                        href="https://www.instagram.com/indumentaria_soffy?igsh=ZWNqemd2aGM0cWNq"
                        style="margin: 0 10px; text-decoration: none;"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                      >
                        <img 
                          src="https://i.ibb.co/NNwdYSF/instagram-icon.png" 
                          alt="Instagram" 
                          width="20" 
                          height="20" 
                          style="display: inline-block; border: 0;" 
                        />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; font-size: 12px; color: #999999;">
                      <p>Si tienes alguna pregunta, contacta con nuestro equipo de soporte en <a href="mailto:sofiaballesta1424@gmail.com" style="color: #000000; text-decoration: none;">sofiaballesta1424@gmail.com</a></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error al enviar email de restablecimiento:", error);
    return { success: false, error: error.message };
  }
}

// Acción del servidor para verificar un token de email
export async function verifyEmailToken(token) {
  try {
    await connectDB();

    // Obtener todos los usuarios para buscar el token
    // Esta es una solución alternativa al problema del select: false
    const users = await User.find({}).select(
      "+verificationToken +verificationTokenExpires"
    );

    // Buscar manualmente el usuario que coincida con el token
    const user = users.find(
      (u) =>
        u.verificationToken === token && u.verificationTokenExpires > new Date()
    );

    if (!user) {
      return {
        success: false,
        error: "Token de verificación inválido o expirado",
      };
    }

    // Actualizar el usuario como verificado
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return { success: true, email: user.email };
  } catch (error) {
    console.error("Error al verificar email:", error);
    return { success: false, error: error.message };
  }
}

// Acción del servidor para actualizar la contraseña con un token
export async function resetPasswordWithToken(token, password) {
  try {
    if (!token || !password) {
      return {
        success: false,
        error: "Token y nueva contraseña son requeridos",
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: "La contraseña debe tener al menos 6 caracteres",
      };
    }

    await connectDB();

    // Buscar usuario con el token proporcionado y no expirado
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return { success: false, error: "Token inválido o expirado" };
    }

    // Actualizar la contraseña y eliminar el token
    user.password = password; // El hook pre-save se encargará de hashear
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { success: true };
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    return { success: false, error: error.message };
  }
}
