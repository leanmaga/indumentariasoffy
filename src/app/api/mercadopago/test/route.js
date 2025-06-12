// src/app/api/mercadopago/test/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { checkMercadoPagoStatus } from "@/lib/mercadopago";

export async function GET() {
  try {
    // Verificar que solo administradores puedan usar este endpoint
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    console.log("🧪 Iniciando verificación de configuración MercadoPago...");

    // Verificar variables de entorno
    const envCheck = {
      NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY:
        !!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
      MERCADOPAGO_ACCESS_TOKEN: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      MERCADOPAGO_CLIENT_ID: !!process.env.MERCADOPAGO_CLIENT_ID,
      MERCADOPAGO_CLIENT_SECRET: !!process.env.MERCADOPAGO_CLIENT_SECRET,
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    };

    console.log("🔧 Variables de entorno:", envCheck);

    // Verificar estado de configuración
    const mpStatus = await checkMercadoPagoStatus();
    console.log("📊 Estado de MercadoPago:", mpStatus);

    // Verificar URLs
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const urls = {
      webhookUrl: `${baseUrl}/api/mercadopago/webhook`,
      successUrl: `${baseUrl}/checkout/success`,
      failureUrl: `${baseUrl}/checkout/failure`,
      pendingUrl: `${baseUrl}/checkout/pending`,
    };

    console.log("🔗 URLs configuradas:", urls);

    // Verificar configuración de emails
    const emailCheck = {
      EMAIL_SERVICE: !!process.env.EMAIL_SERVICE,
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASS: !!process.env.EMAIL_PASS,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    };

    console.log("📧 Configuración de emails:", emailCheck);

    // Calcular score de configuración
    const envScore = Object.values(envCheck).filter(Boolean).length;
    const emailScore = Object.values(emailCheck).filter(Boolean).length;
    const totalScore = envScore + emailScore;
    const maxScore =
      Object.keys(envCheck).length + Object.keys(emailCheck).length;

    const warnings = [];
    const errors = [];

    // Validaciones críticas
    if (!envCheck.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
      errors.push("Falta NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY");
    }
    if (!envCheck.MERCADOPAGO_ACCESS_TOKEN) {
      errors.push("Falta MERCADOPAGO_ACCESS_TOKEN");
    }
    if (!envCheck.NEXT_PUBLIC_BASE_URL && !envCheck.NEXTAUTH_URL) {
      errors.push("Falta URL base (NEXT_PUBLIC_BASE_URL o NEXTAUTH_URL)");
    }

    // Validaciones de advertencia
    if (!emailCheck.EMAIL_USER || !emailCheck.EMAIL_PASS) {
      warnings.push(
        "Configuración de emails incompleta - los emails automáticos no funcionarán"
      );
    }
    if (
      !envCheck.MERCADOPAGO_CLIENT_ID ||
      !envCheck.MERCADOPAGO_CLIENT_SECRET
    ) {
      warnings.push(
        "Credenciales OAuth de MercadoPago no configuradas - función de vinculación no disponible"
      );
    }

    const result = {
      success: errors.length === 0,
      score: `${totalScore}/${maxScore}`,
      environment: process.env.NODE_ENV,

      configuration: {
        environment: envCheck,
        email: emailCheck,
        mercadopago: mpStatus,
        urls,
      },

      status: {
        errors,
        warnings,
        ready: errors.length === 0 && mpStatus.isConfigured,
      },

      recommendations: [],

      timestamp: new Date().toISOString(),
    };

    // Agregar recomendaciones
    if (errors.length === 0) {
      result.recommendations.push("✅ Configuración básica completa");
    }
    if (warnings.length === 0) {
      result.recommendations.push("✅ Configuración avanzada completa");
    }
    if (mpStatus.isConfigured) {
      result.recommendations.push("✅ MercadoPago configurado correctamente");
    } else {
      result.recommendations.push(
        "⚠️ Configura MercadoPago desde el panel de admin"
      );
    }
    if (emailCheck.EMAIL_USER && emailCheck.EMAIL_PASS) {
      result.recommendations.push("✅ Emails automáticos habilitados");
    }

    // Agregar instrucciones de prueba si todo está listo
    if (result.status.ready) {
      result.testInstructions = {
        step1: "Crear un producto de prueba con precio bajo",
        step2: "Agregarlo al carrito y proceder al checkout",
        step3: "Usar datos de tarjeta de prueba de MercadoPago",
        step4: "Verificar que lleguen los emails automáticos",
        testCards: {
          visa: "4509 9535 6623 3704",
          mastercard: "5031 7557 3453 0604",
          securityCode: "123",
          expirationDate: "11/25",
        },
      };
    }

    console.log("✅ Verificación completada:", {
      ready: result.status.ready,
      errors: errors.length,
      warnings: warnings.length,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error en verificación:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
