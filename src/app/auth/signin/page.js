"use client";

import { useEffect } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Componente interno que maneja la redirección
function RedirectComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtener todos los parámetros de búsqueda para preservarlos en la redirección
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    params.append(key, value);
  });

  useEffect(() => {
    // Construir la URL de redirección con los mismos parámetros
    const queryString = params.toString();
    const redirectUrl = `/auth/login${queryString ? `?${queryString}` : ""}`;

    router.replace(redirectUrl);
  }, [router, params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      Redirigiendo...
    </div>
  );
}

// Componente principal con Suspense
export default function SignInRedirect() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          Cargando...
        </div>
      }
    >
      <RedirectComponent />
    </Suspense>
  );
}
