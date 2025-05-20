'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { sendPasswordResetEmail } from "@/lib/email-actions"; // Importar directamente la server action

export default function ResetPasswordPage({ isInModal = false, onBackToLogin, afterSubmit }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Usar directamente la server action en lugar de hacer una solicitud fetch
      const result = await sendPasswordResetEmail(email);
      
      if (!result.success) {
        // Si hay un error específico que debemos mostrar al usuario
        if (result.error && result.error.includes("Google")) {
          throw new Error(result.error);
        }
        
        // Para otros errores, lanza un error genérico
        throw new Error("Error al procesar la solicitud");
      }

      toast.success(
        "Te hemos enviado un correo con instrucciones para restablecer tu contraseña"
      );
      setSubmitted(true);
      
      // Si estamos en el modal y hay una función afterSubmit, la llamamos
      if (isInModal && typeof afterSubmit === 'function') {
        setTimeout(() => {
          afterSubmit();
        }, 1500); // Esperar un poco para que el usuario vea el mensaje de éxito
      }
    } catch (error) {
      console.error("Error al solicitar recuperación:", error);
      setError(error.message || "Error al procesar la solicitud");
      toast.error(error.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={isInModal ? "" : "min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"}>
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
            Revisa tu correo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hemos enviado instrucciones para restablecer tu contraseña a{" "}
            <span className="font-medium text-indigo-600">{email}</span>. Revisa
            tu bandeja de entrada y sigue el enlace.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => setSubmitted(false)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Intentar con otro correo
              </button>
              
              {isInModal && typeof onBackToLogin === 'function' ? (
                <button
                  onClick={onBackToLogin}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Volver a iniciar sesión
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Volver a iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isInModal ? "" : "min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Recupera tu contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ingresa tu correo electrónico y te enviaremos instrucciones para
          restablecer tu contraseña.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-md">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {loading ? "Enviando..." : "Enviar instrucciones"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O</span>
              </div>
            </div>

            <div className="mt-6">
              {isInModal && typeof onBackToLogin === 'function' ? (
                <button
                  onClick={onBackToLogin}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Volver a iniciar sesión
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Volver a iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}