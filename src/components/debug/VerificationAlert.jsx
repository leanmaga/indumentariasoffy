"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function VerificationAlert() {
  const { data: session } = useSession();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);

  // Si no hay sesión o el usuario ya está verificado o el mensaje fue descartado, no mostramos nada
  if (!session?.user || session.user.isVerified || dismissed) {
    return null;
  }

  const handleResendVerification = async () => {
    try {
      setResending(true);
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session.user.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al enviar el email de verificación");
      }

      toast.success("Correo de verificación enviado. Revisa tu bandeja de entrada.");
    } catch (error) {
      console.error("Error al enviar email de verificación:", error);
      toast.error(error.message || "Error al enviar el correo de verificación");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Tu cuenta no está verificada. Por favor, verifica tu correo electrónico para acceder a todas las funcionalidades.
          </p>
          <div className="mt-4 flex space-x-3">
            <button
              type="button"
              className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-md border border-yellow-400 hover:bg-yellow-200"
              onClick={handleResendVerification}
              disabled={resending}
            >
              {resending ? "Enviando..." : "Reenviar correo de verificación"}
            </button>
            <button
              type="button"
              className="bg-white text-gray-500 text-xs font-medium px-2.5 py-0.5 rounded-md border border-gray-300 hover:bg-gray-100"
              onClick={() => setDismissed(true)}
            >
              Descartar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}