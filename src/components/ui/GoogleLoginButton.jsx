"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-hot-toast";

export default function GoogleLoginButton({ callbackUrl = "/" }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    console.log("Iniciando login con Google, callbackUrl:", callbackUrl);
    setIsLoading(true);

    try {
      // Enfoque directo para el login con Google
      await signIn("google", {
        callbackUrl,
        redirect: true, // Crucial: dejar que NextAuth maneje la redirección
      });

      // Con redirect:true, nunca llegará aquí porque la página se recargará
    } catch (error) {
      console.error("Error en GoogleLoginButton:", error);
      toast.error("Error al conectar con Google");
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
