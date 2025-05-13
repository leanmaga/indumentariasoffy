"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

function LoginFormContent({ type = "user", switchToRegister, afterLogin }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const error = searchParams.get("error"); // Para capturar errores de NextAuth

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Manejo de errores de NextAuth
  useEffect(() => {
    if (error) {
      switch (error) {
        case "OAuthAccountNotLinked":
          toast.error(
            "Esta cuenta ya existe con otro método de inicio de sesión. Se ha vinculado automáticamente, por favor intenta nuevamente."
          );
          break;
        case "Callback":
          toast.error(
            "Hubo un problema al comunicarse con Google. Por favor, intenta de nuevo."
          );
          break;
        case "AccessDenied":
          toast.error("Acceso denegado. Por favor, intenta con otro método.");
          break;
        default:
          toast.error(
            "Error al iniciar sesión. Por favor, intenta nuevamente."
          );
      }
    }
  }, [error]);

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        role: type,
      });

      if (result.error) {
        toast.error("Credenciales incorrectas");
        setIsLoading(false);
      } else {
        toast.success(
          `Inicio de sesión exitoso como ${
            type === "admin" ? "administrador" : "usuario"
          }`
        );

        if (typeof afterLogin === "function") {
          afterLogin();
          setTimeout(() => {
            router.push(type === "admin" ? "/admin" : "/");
          }, 100);
        } else {
          router.push(type === "admin" ? "/admin" : "/");
        }
      }
    } catch (error) {
      toast.error("Error al iniciar sesión");
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      // Simplifico la función para usar redirección directa
      // ya que manejar el redirect: false con OAuth puede ser problemático
      await signIn("google", {
        callbackUrl: type === "admin" ? "/admin" : redirect,
      });
      // No necesitamos setIsGoogleLoading(false) porque redirige
    } catch (error) {
      toast.error("Error al conectar con Google");
      console.error("Google sign in error:", error);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="font-sora-bold text-center text-2xl font-semibold mb-6">
        INICIAR SESIÓN
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            className={`w-full border border-gray-300 px-3 py-3 text-gray-900 focus:outline-none focus:border-black ${
              errors.email ? "border-red-500" : ""
            }`}
            {...register("email", {
              required: "El correo electrónico es requerido",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Formato de correo electrónico inválido",
              },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm mb-2">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className={`w-full border border-gray-300 px-3 py-3 pr-10 text-gray-900 focus:outline-none focus:border-black ${
                errors.password ? "border-red-500" : ""
              }`}
              {...register("password", {
                required: "La contraseña es requerida",
                minLength: {
                  value: 6,
                  message: "La contraseña debe tener al menos 6 caracteres",
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700"
            >
              Recordarme
            </label>
          </div>
          <Link
            href="/auth/reset-password"
            className="text-sm font-medium text-black hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button type="submit" disabled={isLoading} className="w-full btn-drop">
          <span>{isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}</span>
        </button>
      </form>

      <div className="mt-6 text-center">
        <div className="relative py-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-white text-sm text-gray-500">O</span>
          </div>
        </div>

        {/* Botón de inicio de sesión con Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="mt-3 w-full flex justify-center items-center space-x-2 border border-gray-300 py-3 px-4 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-sm"
        >
          <FcGoogle size={20} />
          <span className="ml-2">
            {isGoogleLoading ? "Conectando..." : "Continuar con Google"}
          </span>
        </button>

        {type === "user" && (
          <p className="mt-4 text-sm">
            ¿No tienes cuenta?{" "}
            {switchToRegister ? (
              <button
                type="button"
                onClick={switchToRegister}
                className="font-medium text-black hover:underline"
              >
                Regístrate
              </button>
            ) : (
              <Link
                href="/auth/register"
                className="font-medium text-black hover:underline"
              >
                Regístrate
              </Link>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

const LoginForm = (props) => {
  return (
    <Suspense fallback={<div className="p-4 text-center">Cargando...</div>}>
      <LoginFormContent {...props} />
    </Suspense>
  );
};

export default LoginForm;
