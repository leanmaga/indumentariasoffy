// src/helpers/googleAuthHelpers.js
import { NextResponse } from "next/server";
import { signIn } from "next-auth/react";

// Función simplificada para detectar dispositivos móviles
export function isMobileDevice(userAgent) {
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS/i;
  return mobileRegex.test(userAgent || "");
}

// Función simplificada para manejar inicio de sesión con Google
export async function handleGoogleSignIn(options = {}) {
  const { callbackUrl = "/" } = options;

  try {
    // Usar enfoque directo en lugar de redirección manual
    return await signIn("google", {
      callbackUrl,
      redirect: true, // Dejar que NextAuth maneje la redirección
    });
  } catch (error) {
    console.error("Error en handleGoogleSignIn:", error);
    return { error: error.message };
  }
}
