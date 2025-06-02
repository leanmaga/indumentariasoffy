// app/auth/verify-email/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function VerifyEmailPage() {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setError("No se proporcionó un token de verificación válido");
      return;
    }
    const verifyToken = async () => {
      try {
        const response = await fetch("/api/auth/verify-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Error al verificar el correo electrónico"
          );
        }

        setSuccess(true);
        setEmail(data.email || "");
        toast.success("¡Correo electrónico verificado con éxito!");

        // Redireccionar después de 5 segundos
        setTimeout(() => {
          router.push("/auth/login");
        }, 5000);
      } catch (error) {
        console.error("Error al verificar email:", error);
        setError(error.message || "Error al verificar el correo electrónico");
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, router]);

  // Resto de tu código UI para los estados de carga, éxito y error
  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verificando tu correo electrónico
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Espera un momento mientras verificamos tu correo electrónico...
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ¡Correo verificado!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Tu correo electrónico{" "}
            {email && (
              <span className="font-medium text-indigo-600">{email}</span>
            )}{" "}
            ha sido verificado con éxito. Ya puedes iniciar sesión en tu cuenta.
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            Serás redirigido a la página de inicio de sesión en 5 segundos...
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Link
              href="/auth/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Error de verificación
          </h2>
          <p className="mt-2 text-center text-sm text-red-600">{error}</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-4">
              <Link
                href="/auth/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Ir a iniciar sesión
              </Link>
              <button
                onClick={() => {
                  const email = prompt(
                    "Ingresa tu correo electrónico para reenviar el enlace de verificación"
                  );
                  if (email) {
                    fetch("/api/auth/verify-email", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email }),
                    })
                      .then((res) => res.json())
                      .then((data) => {
                        if (data.success !== false) {
                          toast.success(
                            "Enlace de verificación reenviado. Revisa tu correo."
                          );
                        } else {
                          toast.error(
                            data.message ||
                              "Error al reenviar el enlace de verificación"
                          );
                        }
                      })
                      .catch((err) => {
                        toast.error(
                          "Error al reenviar el enlace de verificación."
                        );
                      });
                  }
                }}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reenviar enlace de verificación
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
