// src/helpers/googleAuthHelpers.js
import { NextResponse } from "next/server";
import { signIn } from "next-auth/react";

// Función para detectar dispositivos móviles
export function isMobileDevice(userAgent) {
  const userAgentString =
    userAgent ||
    (typeof window !== "undefined" ? window.navigator.userAgent : "");

  // Expresión regular ampliada para detectar más dispositivos móviles
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS/i;

  return mobileRegex.test(userAgentString);
}

// Modificar la configuración de NextAuth para mejorar el soporte móvil
export function fixGoogleAuthConfig(authOptions) {
  // Guardar referencia al callback original
  const originalSignInCallback = authOptions.callbacks?.signIn;

  // Si ya hay callbacks definidos, mejorarlos
  if (authOptions.callbacks) {
    // Mejorar el callback signIn para Google
    authOptions.callbacks.signIn = async (params) => {
      const { account } = params;

      // Si no es Google o no hay callback original, comportamiento estándar
      if (account?.provider !== "google" || !originalSignInCallback) {
        return params.account?.provider === "google" || originalSignInCallback
          ? await originalSignInCallback(params)
          : true;
      }

      // Usar el callback original pero con mejor manejo de errores
      try {
        return await originalSignInCallback(params);
      } catch (error) {
        console.error("Error mejorado en signIn callback:", error);
        // Intentar recuperarse de ciertos errores
        if (
          error.message?.includes("connection") ||
          error.message?.includes("timeout")
        ) {
          console.log("Intentando recuperarse de error de conexión...");
          // En caso de error de conexión, podríamos intentar nuevamente o usar una estrategia alternativa
        }
        return false;
      }
    };
  }

  // Asegurarse de que las cookies estén configuradas correctamente para dispositivos móviles
  // Esto es crucial para el flujo OAuth en iOS y Android
  authOptions.cookies = {
    ...authOptions.cookies,
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "none", // Crítico para OAuth en móviles
        path: "/",
        secure: true, // Requerido cuando sameSite es "none"
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  };

  // Mejorar la configuración del proveedor de Google si existe
  const googleProvider = authOptions.providers?.find(
    (provider) => provider.id === "google" || provider.name === "google"
  );

  if (googleProvider) {
    // Asegurar que la configuración de autorización sea óptima
    googleProvider.authorization = {
      ...googleProvider.authorization,
      params: {
        ...googleProvider.authorization?.params,
        prompt: "consent", // Siempre mostrar pantalla de consentimiento
        access_type: "offline", // Permitir refresh tokens
        response_type: "code", // Utilizar flujo de autorización de código
      },
    };
  }

  return authOptions;
}

// Ajuste del middleware para permitir redirecciones de Google Auth
export function allowGoogleAuthRedirects(request, nextResponse) {
  // Añadir headers CORS específicos para Google Auth
  const response = nextResponse || NextResponse.next();

  // Estos headers son cruciales para el flujo OAuth cross-origin
  response.headers.append("Access-Control-Allow-Origin", "*");
  response.headers.append("Access-Control-Allow-Credentials", "true");
  response.headers.append(
    "Access-Control-Allow-Methods",
    "GET,DELETE,PATCH,POST,PUT"
  );
  response.headers.append(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  return response;
}

// Función mejorada para manejar el inicio de sesión con Google
export async function handleGoogleSignIn(options = {}) {
  const { callbackUrl = "/", onError = null, onSuccess = null } = options;

  try {
    // Detectar si es un dispositivo móvil
    const isMobile =
      typeof window !== "undefined"
        ? isMobileDevice(window.navigator.userAgent)
        : false;

    console.log(`Dispositivo móvil detectado: ${isMobile}`);

    const signInOptions = {
      callbackUrl,
      prompt: "select_account",
      // IMPORTANTE: En móviles podríamos querer redirigir directamente
      redirect: false,
    };

    console.log("Iniciando sesión con Google usando opciones:", signInOptions);

    // Iniciar sesión con Google
    const result = await signIn("google", signInOptions);
    console.log("Resultado de inicio de sesión:", result);

    // Manejo especial para móviles
    if (isMobile && result?.url) {
      console.log(
        "Realizando redirección manual en dispositivo móvil a:",
        result.url
      );
      // Para iOS, a veces necesitamos forzar la redirección
      window.location.href = result.url;
      return { success: true, redirected: true };
    }

    // Si proporcionaron un callback de éxito, llamarlo
    if (onSuccess && typeof onSuccess === "function" && result?.ok) {
      onSuccess(result);
    }

    return result;
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);

    // Si proporcionaron un callback de error, llamarlo
    if (onError && typeof onError === "function") {
      onError(error);
    }

    return {
      error: error.message || "Error desconocido al iniciar sesión con Google",
    };
  }
}
