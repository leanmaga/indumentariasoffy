// src/app/api/mercadopago/auth/callback/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MercadoPagoConfig from "@/models/MercadoPagoConfig";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  try {
    // Obtener el código de autorización
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // userId del admin (opcional)

    // Obtener URL base
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/admin/settings?error=no_code`);
    }

    // Intercambiar código por token
    const response = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_secret: process.env.MERCADOPAGO_CLIENT_SECRET,
        client_id:
          process.env.MERCADOPAGO_CLIENT_ID || process.env.MERCADOPAGO_APP_ID,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: `${baseUrl}/api/mercadopago/auth/callback`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error al obtener token:", data);
      return NextResponse.redirect(
        `${baseUrl}/admin/settings?error=token_error&details=${encodeURIComponent(
          JSON.stringify(data)
        )}`
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Obtener sesión del admin actual
    const session = await getServerSession(authOptions);
    const userId = state || session?.user?.id || "default";

    // Desactivar cualquier configuración anterior
    await MercadoPagoConfig.updateMany({ isActive: true }, { isActive: false });

    // Guardar la nueva configuración
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    const config = await MercadoPagoConfig.findOneAndUpdate(
      { userId },
      {
        userId,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        publicKey: data.public_key,
        userIdMP: data.user_id,
        isProduction: true,
        expiresAt,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // Redirigir a una página de éxito
    return NextResponse.redirect(
      `${baseUrl}/admin/settings?success=true&mp_connected=true`
    );
  } catch (error) {
    console.error("Error en callback:", error);

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    return NextResponse.redirect(
      `${baseUrl}/admin/settings?error=server_error&details=${encodeURIComponent(
        error.message
      )}`
    );
  }
}
