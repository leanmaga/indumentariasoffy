"use client";

import { useState } from "react";
import Link from "next/link";
import { EnvelopeIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function RegistrationSuccessPage() {
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  // Try to get the email from localStorage if it was saved during registration
  useState(() => {
    const storedEmail = localStorage.getItem("registrationEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Ingresa tu correo electrónico para reenviar la verificación");
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("¡Correo de verificación reenviado! Revisa tu bandeja de entrada.");
      } else {
        throw new Error(data.message || "Error al reenviar el correo de verificación");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error al reenviar el correo de verificación");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <EnvelopeIcon className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          ¡Registro exitoso!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Te hemos enviado un correo de verificación a
          {email && <span className="font-medium text-indigo-600"> {email}</span>}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Importante
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Por favor, verifica tu cuenta haciendo clic en el enlace que enviamos a tu correo electrónico. 
                    Si no encuentras el correo, revisa tu carpeta de spam o correo no deseado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!email && (
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico para reenviar verificación
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="tu@email.com"
              />
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isResending ? "Reenviando..." : "Reenviar correo de verificación"}
            </button>

            <Link
              href="/auth/login"
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ir a iniciar sesión
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}