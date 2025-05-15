import { NextResponse } from "next/server";

export async function GET(request) {
  // Obtener el client ID y secret de las variables de entorno
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/google/callback`;

  // Crear la URL de autorización de Google
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("scope", "openid email profile");

  // Redirigir al usuario a la URL de autorización de Google
  return NextResponse.redirect(authUrl.toString());
}
