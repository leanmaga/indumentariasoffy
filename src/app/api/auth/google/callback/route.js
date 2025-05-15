import { NextResponse } from "next/server";
import { authenticateWithGoogle } from "@/lib/auth";

export async function GET(request) {
  // Obtener el código de autorización de la URL
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { message: "Código de autorización no proporcionado" },
      { status: 400 }
    );
  }

  try {
    // Obtener tokens de Google
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.json(
        { message: "Error al obtener el token de acceso" },
        { status: 400 }
      );
    }

    // Obtener información del usuario
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const googleUser = await userResponse.json();

    // Autenticar el usuario
    await authenticateWithGoogle(googleUser);

    // Redirigir al dashboard después de autenticación exitosa
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`);
  } catch (error) {
    console.error("Error en callback de Google:", error);
    return NextResponse.json(
      { message: "Error en la autenticación" },
      { status: 500 }
    );
  }
}
