"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RedirectComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirecting, setRedirecting] = useState(true);

  // Obtener todos los parámetros de búsqueda
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    params.append(key, value);
  });

  useEffect(() => {
    // Añadir detección de móviles
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Construir la URL de redirección
    const queryString = params.toString();
    const redirectUrl = `/auth/login${queryString ? `?${queryString}` : ""}`;

    // Usar técnica apropiada según dispositivo
    if (isMobile) {
      // En móviles, usar window.location para evitar problemas con router
      window.location.href = redirectUrl;
    } else {
      // En desktop, usar router.replace
      router.replace(redirectUrl);
    }

    // Configurar timeout de seguridad
    const timeout = setTimeout(() => {
      setRedirecting(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router, params]);

  // Mostrar mensaje alternativo si la redirección tarda demasiado
  if (!redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="mb-4 text-center">
          La redirección está tardando más de lo esperado.
        </p>
        <a
          href="/auth/login"
          className="py-2 px-4 bg-black text-white rounded-md"
        >
          Ir a página de inicio de sesión
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      Redirigiendo...
    </div>
  );
}

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
