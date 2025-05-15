"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function GoogleLoginButton({ callbackUrl = "/" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es dispositivo móvil
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleGoogleLogin = () => {
    setIsLoading(true);

    // Para dispositivos móviles, usar un enfoque directo
    if (isMobile) {
      // Redirigir directamente a la URL de login de Google
      window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(
        callbackUrl
      )}`;
      return; // Importante para evitar que se ejecute el resto del código
    }

    // Para desktop, usar el método normal
    signIn("google", { callbackUrl, redirect: true });
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
