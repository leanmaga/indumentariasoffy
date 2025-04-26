"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

// Componente interno que usa useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Mostrar mensaje de error basado en el parámetro
  const getErrorMessage = () => {
    switch (error) {
      case "CredentialsSignin":
        return "Credenciales inválidas. Por favor verifica tu email y contraseña.";
      case "SessionRequired":
        return "Debes iniciar sesión para acceder a esta página.";
      default:
        return "Se produjo un error durante la autenticación. Por favor intenta nuevamente.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Error de autenticación
          </h2>
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p>{getErrorMessage()}</p>
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href="/auth/login"
              className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver a intentar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal envuelto en Suspense
export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
