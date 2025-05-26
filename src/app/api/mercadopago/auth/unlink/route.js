// src/app/api/mercadopago/auth/unlink/route.js
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

    // Buscar y eliminar la configuración activa
    const result = await MercadoPagoConfig.findOneAndDelete({ isActive: true });

    if (!result) {
      return NextResponse.json(
        { error: "No hay configuración de MercadoPago para desvincular" },
        { status: 404 }
      );
    }

    console.log(
      "Configuración de MercadoPago desvinculada por:",
      session.user.email
    );

    return NextResponse.json({
      success: true,
      message: "Cuenta de MercadoPago desvinculada correctamente",
    });
  } catch (error) {
    console.error("Error al desvincular cuenta de MercadoPago:", error);
    return NextResponse.json(
      { error: "Error del servidor al desvincular la cuenta" },
      { status: 500 }
    );
  }
}
