'use server';

import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

// Función para crear un transportador de email
async function createEmailTransporter() {
  // Para desarrollo (pruebas locales)
  if (process.env.NODE_ENV === 'development') {
    // Crear cuenta de prueba en Ethereal para desarrollo
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      // Ignorar errores de certificados en desarrollo
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  
  // Para producción
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Solo usar en desarrollo o si confías en el servidor
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
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
    
    // URL de verificación
    const verificationUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
    
    // Enviar email
    const info = await transporter.sendMail({
      from: `"Tu Tienda" <${process.env.EMAIL_USER || 'noreply@tutienda.com'}>`,
      to: user.email,
      subject: 'Verifica tu cuenta',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">¡Bienvenido/a a Tu Tienda!</h2>
          <p>Gracias por registrarte. Por favor, verifica tu dirección de correo electrónico haciendo clic en el siguiente enlace:</p>
          <p style="margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verificar mi correo electrónico</a>
          </p>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="color: #666;">${verificationUrl}</p>
          <p>Este enlace expirará en 24 horas.</p>
          <p>Si no has solicitado esta verificación, puedes ignorar este correo.</p>
        </div>
      `,
    });
    
    // En desarrollo, mostrar URL para ver el email
    if (process.env.NODE_ENV === 'development') {
      console.log('URL para ver el email:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar email de verificación:', error);
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
      return { success: true, message: "Si el correo existe, se ha enviado un enlace de recuperación" };
    }
    
    // Si el usuario usa solo Google Auth y no tiene contraseña tradicional
    if (user.googleAuth && !user.password) {
      return { success: false, error: "Esta cuenta usa Google para iniciar sesión, no se puede restablecer la contraseña" };
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
    
    // URL de restablecimiento
    const resetUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;
    
    // Enviar email
    const info = await transporter.sendMail({
      from: `"Tu Tienda" <${process.env.EMAIL_USER || 'noreply@tutienda.com'}>`,
      to: user.email,
      subject: 'Restablece tu contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Restablecimiento de contraseña</h2>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Restablecer mi contraseña</a>
          </p>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="color: #666;">${resetUrl}</p>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no has solicitado este restablecimiento, puedes ignorar este correo.</p>
        </div>
      `,
    });
    
    // En desarrollo, mostrar URL para ver el email
    if (process.env.NODE_ENV === 'development') {
      console.log('URL para ver el email:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar email de restablecimiento:', error);
    return { success: false, error: error.message };
  }
}

// Acción del servidor para verificar un token de email
export async function verifyEmailToken(token) {
  try {
    await connectDB();
    
    // Buscar usuario con el token proporcionado y no expirado
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });
    
    if (!user) {
      return { success: false, error: "Token de verificación inválido o expirado" };
    }
    
    // Actualizar el usuario como verificado y eliminar el token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    return { success: true, email: user.email };
  } catch (error) {
    console.error('Error al verificar email:', error);
    return { success: false, error: error.message };
  }
}

// Acción del servidor para actualizar la contraseña con un token
export async function resetPasswordWithToken(token, password) {
  try {
    if (!token || !password) {
      return { success: false, error: "Token y nueva contraseña son requeridos" };
    }
    
    if (password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres" };
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
    console.error('Error al restablecer la contraseña:', error);
    return { success: false, error: error.message };
  }
}