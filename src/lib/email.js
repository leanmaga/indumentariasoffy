// lib/email.js
import nodemailer from 'nodemailer';

// Crear un transportador de email - puedes usar un servicio como Gmail o un SMTP propio
// Para producción, recomiendo servicios como SendGrid, Mailgun, etc.
export function createEmailTransporter() {
  // Para desarrollo (pruebas locales)
  if (process.env.NODE_ENV === 'development') {
    // Puedes usar Ethereal para pruebas (emails falsos pero visibles)
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER, // Genera una cuenta en ethereal.email
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  // Para producción - ejemplo con Gmail
  // Nota: para Gmail necesitarás una "contraseña de aplicación"
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  /* 
  // Alternativa con servicio SMTP personalizado
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  */
}

// Función para enviar email de verificación
export async function sendVerificationEmail(user, verificationToken) {
  const transporter = createEmailTransporter();
  
  // URL del frontend para verificar email
  const verificationUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: `"Tu Tienda" <${process.env.EMAIL_USER}>`,
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
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de verificación enviado:', info.messageId);
    
    // Para desarrollo, muestra la URL para ver el email (si usas Ethereal)
    if (process.env.NODE_ENV === 'development') {
      console.log('URL para ver el email:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar email de verificación:', error);
    return { success: false, error: error.message };
  }
}

// Función para enviar email de restablecimiento de contraseña
export async function sendPasswordResetEmail(user, resetToken) {
  const transporter = createEmailTransporter();
  
  // URL del frontend para restablecer contraseña
  const resetUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `"Tu Tienda" <${process.env.EMAIL_USER}>`,
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
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de restablecimiento enviado:', info.messageId);
    
    // Para desarrollo, muestra la URL para ver el email (si usas Ethereal)
    if (process.env.NODE_ENV === 'development') {
      console.log('URL para ver el email:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar email de restablecimiento:', error);
    return { success: false, error: error.message };
  }
}