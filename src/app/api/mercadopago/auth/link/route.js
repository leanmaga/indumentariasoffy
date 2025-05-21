// src/app/api/mercadopago/auth/link/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Verificar que solo administradores puedan generar links
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    
    // Crear URL de autorización
    const authUrl = new URL("https://auth.mercadopago.com/authorization");
    authUrl.searchParams.append("client_id", "7032903478408049"); // Tu Client ID
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("platform_id", "mp");
    authUrl.searchParams.append("redirect_uri", 
      `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/mercadopago/auth/callback`);
    
    // Retornar la URL para que el frontend pueda redirigir
    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("Error generando link:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}