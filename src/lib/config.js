// src/lib/config.js - HELPER DE CONFIGURACIÓN AUTOMÁTICA
export function getMercadoPagoConfig() {
  const isDevelopment = process.env.NODE_ENV === "development";

  // En desarrollo, preferir credenciales de test si están disponibles
  if (isDevelopment) {
    const devAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN_DEV;
    const devPublicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY_DEV;

    if (devAccessToken && devPublicKey) {
      console.log("🧪 Usando credenciales de TEST/Sandbox para desarrollo");
      return {
        accessToken: devAccessToken,
        publicKey: devPublicKey,
        environment: "sandbox",
        canUseTestCards: true,
      };
    } else {
      console.warn(
        "⚠️ ATENCIÓN: Usando credenciales de PRODUCCIÓN en desarrollo!"
      );
      console.warn(
        "⚠️ Los pagos serán REALES. Configura credenciales de test para desarrollo seguro."
      );
      return {
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
        publicKey: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
        environment: "production",
        canUseTestCards: false,
      };
    }
  } else {
    // En producción, usar credenciales de producción
    console.log("🚀 Usando credenciales de PRODUCCIÓN");
    return {
      accessToken:
        process.env.MERCADOPAGO_ACCESS_TOKEN_PROD ||
        process.env.MERCADOPAGO_ACCESS_TOKEN,
      publicKey:
        process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY_PROD ||
        process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
      environment: "production",
      canUseTestCards: false,
    };
  }
}

// Función para verificar configuración
export function checkMercadoPagoConfig() {
  const config = getMercadoPagoConfig();
  const isDevelopment = process.env.NODE_ENV === "development";

  const issues = [];
  const warnings = [];

  if (!config.accessToken) {
    issues.push("Falta MERCADOPAGO_ACCESS_TOKEN");
  }

  if (!config.publicKey) {
    issues.push("Falta NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY");
  }

  if (isDevelopment && config.environment === "production") {
    warnings.push(
      "Usando credenciales de producción en desarrollo - los pagos serán reales"
    );
  }

  if (
    config.accessToken &&
    !config.accessToken.startsWith("APP_USR-") &&
    !config.accessToken.startsWith("TEST-")
  ) {
    issues.push("Formato de access token inválido");
  }

  return {
    isValid: issues.length === 0,
    config,
    issues,
    warnings,
    recommendations: [
      ...(isDevelopment && config.environment === "production"
        ? [
            "Obtén credenciales de test en https://www.mercadopago.com.ar/developers/",
          ]
        : []),
      ...(issues.length === 0 ? ["Configuración válida ✅"] : []),
    ],
  };
}

// Función para obtener URLs base
export function getBaseUrls() {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    return {
      base: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      frontend: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
      auth: process.env.NEXTAUTH_URL || "http://localhost:3000",
    };
  } else {
    return {
      base:
        process.env.NEXT_PUBLIC_BASE_URL ||
        "https://indumentariasoffy.vercel.app",
      frontend:
        process.env.NEXT_PUBLIC_FRONTEND_URL ||
        "https://indumentariasoffy.vercel.app",
      auth: process.env.NEXTAUTH_URL || "https://indumentariasoffy.vercel.app",
    };
  }
}

// Función para debug de configuración
export function debugConfig() {
  const mpConfig = checkMercadoPagoConfig();
  const urls = getBaseUrls();

  return {
    environment: process.env.NODE_ENV,
    mercadoPago: mpConfig,
    urls,
    timestamp: new Date().toISOString(),
  };
}
