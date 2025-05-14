"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-hot-toast";
import { handleGoogleSignIn } from "@/helpers/googleAuthHelpers";

export default function GoogleLoginButton({ callbackUrl = "/" }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Usamos nuestro helper para manejar el inicio de sesión
      const result = await handleGoogleSignIn({
        callbackUrl,
        onError: (error) => {
          toast.error(
            `Error al iniciar sesión: ${error.message || "Desconocido"}`
          );
        },
      });

      // Si hay un error, nuestro helper ya lo maneja
      if (result?.error) {
        setIsLoading(false);
      }

      // Si el helper devuelve true, significa que ya se encargó de la redirección
      // en móviles, así que no necesitamos hacer nada más
    } catch (error) {
      console.error("Error inesperado:", error);
      toast.error("Error inesperado al conectar con Google");
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full flex justify-center items-center space-x-2 border border-gray-300 py-3 px-4 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-sm"
      disabled={isLoading}
    >
      <FcGoogle size={20} />
      <span className="ml-2">
        {isLoading ? "Conectando..." : "Continuar con Google"}
      </span>
    </button>
  );
}
