// app/api/auth/reset-password/route.js
import { NextResponse } from "next/server";
import { sendPasswordResetEmail, resetPasswordWithToken } from "@/lib/email-actions";

// POST - Solicitar restablecimiento de contraseña
export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { message: "El correo electrónico es requerido" },
        { status: 400 }
      );
    }
    
    // Usar la acción del servidor para enviar el email
    const result = await sendPasswordResetEmail(email);
    
    if (!result.success) {
      // Si hay un error específico para el usuario con cuenta de Google
      if (result.error && result.error.includes("Google")) {
        return NextResponse.json(
          { message: result.error },
          { status: 400 }
        );
      }
      
      // No revelamos errores internos, solo respondemos con mensaje genérico
      return NextResponse.json({
        message: "Si el correo electrónico existe, recibirás instrucciones para restablecer tu contraseña"
      });
    }
    
    return NextResponse.json({
      message: "Si el correo electrónico existe, recibirás instrucciones para restablecer tu contraseña"
    });
  } catch (error) {
    console.error("Error al solicitar restablecimiento de contraseña:", error);
    return NextResponse.json(
      { message: "Error del servidor", error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar la contraseña con el token de restablecimiento
export async function PUT(request) {
  try {
    const { token, password } = await request.json();
    
    // Usar la acción del servidor para actualizar la contraseña
    const result = await resetPasswordWithToken(token, password);
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error || "Token inválido o expirado" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: "Contraseña actualizada con éxito",
    });
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    return NextResponse.json(
      { message: "Error del servidor", error: error.message },
      { status: 500 }
    );
  }
}