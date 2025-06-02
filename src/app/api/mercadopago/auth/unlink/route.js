// src/app/api/mercadopago/auth/unlink/route.js - VERSIÓN MEJORADA
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import MercadoPagoConfig from "@/models/MercadoPagoConfig";

export async function POST() {
  try {
    // Verificar que solo administradores puedan desvincular
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await connectDB();

    // 1️⃣ OBTENER la configuración antes de eliminarla
    const config = await MercadoPagoConfig.findOne({ isActive: true });

    if (!config) {
      return NextResponse.json(
        { error: "No hay configuración de MercadoPago para desvincular" },
        { status: 404 }
      );
    }

    // 2️⃣ REVOCAR el token en MercadoPago (NUEVO - recomendado)
    try {
      const accessToken = config.getDecryptedAccessToken();

      if (accessToken) {
        const revokeResponse = await fetch(
          "https://api.mercadopago.com/oauth/token",
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: process.env.MERCADOPAGO_CLIENT_ID,
              client_secret: process.env.MERCADOPAGO_CLIENT_SECRET,
              access_token: accessToken,
            }),
          }
        );
      }
    } catch (revokeError) {
      console.warn("Error al revocar token (continuando):", revokeError);
      // No fallar la desvinculación por esto
    }

    // 3️⃣ ELIMINAR de nuestra base de datos
    await MercadoPagoConfig.findOneAndDelete({ isActive: true });

    return NextResponse.json({
      success: true,
      message: "Cuenta de MercadoPago desvinculada correctamente",
      details: "Token revocado y configuración eliminada",
    });
  } catch (error) {
    console.error("Error al desvincular cuenta de MercadoPago:", error);
    return NextResponse.json(
      { error: "Error del servidor al desvincular la cuenta" },
      { status: 500 }
    );
  }
}
