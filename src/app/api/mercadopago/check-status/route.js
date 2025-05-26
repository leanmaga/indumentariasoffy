// src/app/api/mercadopago/check-status/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { checkMercadoPagoStatus } from "@/lib/mercadopago";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Solo admins pueden verificar el estado
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const status = await checkMercadoPagoStatus();

    return NextResponse.json({
      isConnected: status.isConfigured,
      isProduction: status.isProduction,
      source: status.source,
      expiresAt: status.expiresAt,
    });
  } catch (error) {
    console.error("Error checking MercadoPago status:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
