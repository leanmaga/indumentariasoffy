"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Obtener el error de los parámetros de URL
    const error = searchParams.get("error");

    // Mapear códigos de error a mensajes amigables
    const errorMessages = {
      Signin: "Intente iniciar sesión de nuevo.",
      OAuthSignin: "Error al iniciar sesión con proveedor externo.",
      OAuthCallback: "Error en la respuesta del proveedor externo.",
      OAuthCreateAccount: "Error al crear cuenta con proveedor externo.",
      EmailCreateAccount: "Error al crear cuenta con correo electrónico.",
      Callback: "Error en el proceso de autenticación.",
      OAuthAccountNotLinked:
        "Para confirmar su identidad, inicie sesión con la misma cuenta que usó originalmente.",
      EmailSignin: "Error al enviar el enlace de verificación.",
      CredentialsSignin:
        "Credenciales incorrectas. Por favor, verifique su correo y contraseña.",
      SessionRequired: "Por favor inicie sesión para acceder a esta página.",
      default: "Se produjo un error durante la autenticación.",
    };

    setErrorMessage(
      error
        ? errorMessages[error] || errorMessages.default
        : errorMessages.default
    );
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Error de autenticación
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">{errorMessage}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col space-y-4">
            <Link
              href="/auth/signin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver a iniciar sesión
            </Link>
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
