import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/email-actions";

// Añadimos soporte para OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "POST, OPTIONS",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: "Token no proporcionado" },
        { status: 400 }
      );
    }

    // Usar la función verifyEmailToken para validar el token
    const result = await verifyEmailToken(token);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error || "Error al verificar el correo" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      email: result.email,
      message: "Correo electrónico verificado con éxito",
    });
  } catch (error) {
    console.error("Error al verificar token:", error);
    return NextResponse.json(
      { message: "Error del servidor", error: error.message },
      { status: 500 }
    );
  }
}
