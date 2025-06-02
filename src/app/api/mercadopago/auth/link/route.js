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
    const APP_ID =
      process.env.MERCADOPAGO_APP_ID || process.env.MERCADOPAGO_CLIENT_ID;

    // Obtener URL base con fallbacks
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const REDIRECT_URI = `${baseUrl}/api/mercadopago/auth/callback`;

    // Validar que tenemos las credenciales necesarias
    if (!APP_ID) {
      console.error("Falta MERCADOPAGO_APP_ID en las variables de entorno");
      return NextResponse.json(
        {
          error:
            "Configuración de MercadoPago incompleta. Contacta al administrador.",
        },
        { status: 500 }
      );
    }

    // Crear URL de autorización OAuth2
    const authUrl = new URL("https://auth.mercadopago.com.ar/authorization");
    authUrl.searchParams.append("client_id", APP_ID);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("platform_id", "mp");
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.append("state", session.user.id);

    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("Error generando link:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
