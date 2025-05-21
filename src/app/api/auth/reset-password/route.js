import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/email-actions";

// Añadimos soporte para OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'PUT, POST, OPTIONS',
      'Access-Control-Allow-Methods': 'PUT, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Soporte para PUT
export async function PUT(request) {
  try {
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { message: "Token y nueva contraseña son requeridos" },
        { status: 400 }
      );
    }
    
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

// Soporte para POST (muchos proxies prefieren POST sobre PUT)
export async function POST(request) {
  // Redirigir al método PUT para mantener un solo código
  return PUT(request);
}