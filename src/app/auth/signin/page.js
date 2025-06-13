"use client";

import { useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Componente interno que maneja la redirección
function RedirectComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ CORRECTO: Solo UNA definición de params con useMemo
  const params = useMemo(
    () => ({
      redirect: searchParams.get("redirect") || "/",
      callbackUrl: searchParams.get("callbackUrl") || "/",
      error: searchParams.get("error"),
    }),
    [searchParams]
  );

  useEffect(() => {
    // Usar los parámetros aquí
    if (params.error) {
      console.error("Error de autenticación:", params.error);
    }

    // Lógica de redirección
    const targetUrl = params.redirect || params.callbackUrl || "/";

    // Ejemplo de redirección después de un delay
    const timer = setTimeout(() => {
      router.push(targetUrl);
    }, 1000);

    return () => clearTimeout(timer);
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo...</p>
        {params.error && (
          <p className="text-red-600 mt-2 text-sm">Error: {params.error}</p>
        )}
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function SignInRedirect() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <RedirectComponent />
    </Suspense>
  );
}
