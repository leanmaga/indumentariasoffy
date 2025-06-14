// api/test-email/route.js - PARA PROBAR CONFIGURACIÓN DE EMAILS
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  verifyEmailConfig,
  sendTestEmail,
  logEmailDetails,
} from "@/lib/email-config";

export async function GET() {
  try {
    // Verificar que el usuario sea admin (opcional)
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    console.log("🧪 Iniciando verificación de configuración de email...");

    // 1. Verificar configuración
    const configResult = await verifyEmailConfig();

    console.log("✅ Resultado verificación:", configResult);

    return NextResponse.json({
      message: "Verificación de email completada",
      timestamp: new Date().toISOString(),
      config: configResult,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        emailUser: process.env.EMAIL_USER,
        emailPassConfigured: !!process.env.EMAIL_PASS,
        adminEmail: process.env.ADMIN_EMAIL,
      },
    });
  } catch (error) {
    console.error("❌ Error verificando configuración de email:", error);

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Verificar que el usuario sea admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { to, action } = await request.json();

    console.log("🧪 Iniciando test de email:", { to, action });

    let result;

    switch (action) {
      case "verify":
        console.log("🔍 Verificando configuración...");
        result = await verifyEmailConfig();
        break;

      case "test":
        console.log("📧 Enviando email de prueba...");
        const testTo = to || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        result = await sendTestEmail(testTo);

        // Log detalles si está en desarrollo
        logEmailDetails({ to: testTo, subject: "Test Email" }, result);
        break;

      default:
        return NextResponse.json(
          { error: "Acción no válida. Usa 'verify' o 'test'" },
          { status: 400 }
        );
    }

    console.log("✅ Resultado de la acción:", result);

    return NextResponse.json({
      message: `Acción '${action}' completada`,
      action,
      timestamp: new Date().toISOString(),
      result,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        emailUser: process.env.EMAIL_USER,
        emailPassConfigured: !!process.env.EMAIL_PASS,
      },
    });
  } catch (error) {
    console.error("❌ Error en test de email:", error);

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message: error.message,
        action: "unknown",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
