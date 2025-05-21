// src/app/api/mercadopago/auth/callback/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

export async function GET(request) {
  try {
    // Obtener el código de autorización
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    
    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/settings?error=no_code`);
    }
    
    console.log("Código de autorización recibido:", code);
    
    // Intercambiar código por token
    const response = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_secret: process.env.MERCADOPAGO_CLIENT_SECRET,
        client_id: process.env.MERCADOPAGO_CLIENT_ID,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/mercadopago/auth/callback`
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Error al obtener token:", data);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/settings?error=token_error`);
    }
    
    // Guardar el token en algún lugar (base de datos, etc.)
    // Por ahora solo mostramos lo que recibimos
    console.log("Token obtenido:", data.access_token);
    console.log("El token expira en:", data.expires_in, "segundos");
    console.log("User ID:", data.user_id);
    
    // También necesitarás guardar estos datos en la base de datos
    // await saveMercadoPagoToken(data);
    
    // Redirigir a una página de éxito
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/settings?success=true`);
  } catch (error) {
    console.error("Error en callback:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/settings?error=server_error`);
  }
}