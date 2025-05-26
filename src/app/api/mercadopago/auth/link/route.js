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

    // Configurar con tu APP_ID de producción
    const APP_ID = process.env.MERCADOPAGO_APP_ID; // Necesitas obtener esto de MercadoPago
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/auth/callback`;

    // Crear URL de autorización OAuth2
    const authUrl = new URL("https://auth.mercadopago.com/authorization");
    authUrl.searchParams.append("client_id", APP_ID);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("platform_id", "mp");
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.append("state", session.user.id); // Para seguridad

    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("Error generando link:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
