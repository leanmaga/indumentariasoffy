"use client";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";

export default function GoogleLoginButton({ callbackUrl = "/" }) {
  const [isLoading, setLoading] = useState(false);
  const handleGoogleLogin = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl, redirect: true });
    setLoading(false);
  };
  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full flex justify-center items-center space-x-2 border border-gray-300 py-3 px-4 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-sm"
      disabled={isLoading}
    >
      <FcGoogle size={20} />
      <span>{isLoading ? "Conectando..." : "Continuar con Google"}</span>
    </button>
  );
}
