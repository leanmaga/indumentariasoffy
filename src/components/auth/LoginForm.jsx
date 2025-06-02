"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import GoogleLoginButton from "../ui/GoogleLoginButton";

export default function LoginForm({
  type = "user",
  switchToRegister,
  afterLogin,
  onForgotPassword,
  isInModal = false,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const error = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (error) {
      switch (error) {
        case "OAuthAccountNotLinked":
          toast.error(
            "Esta cuenta ya existe con otro método de inicio de sesión."
          );
          break;
        case "Callback":
          toast.error(
            "Hubo un problema al comunicarse con Google. Por favor, intenta de nuevo."
          );
          break;
        default:
          toast.error("Error de autenticación: " + error);
          break;
      }

      // Clean error parameter from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      window.history.replaceState({}, document.title, newUrl.toString());
    }
  }, [error]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        console.error("Login error:", result.error);

        // Verificar si es un usuario no verificado
        if (
          result.error.includes("not verified") ||
          result.error.includes("no verificado")
        ) {
          setLoginError(
            "Tu cuenta no está verificada. Por favor, revisa tu correo y verifica tu cuenta."
          );
          toast.error(
            "Cuenta no verificada. Revisa tu correo para verificar tu cuenta."
          );

          // Opcional: ofrecer reenviar correo de verificación
          const shouldResend = window.confirm(
            "¿Deseas que te reenviemos el correo de verificación?"
          );
          if (shouldResend) {
            const resendResult = await fetch("/api/auth/verify-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: data.email }),
            }).then((res) => res.json());

            if (resendResult.success) {
              toast.success(
                "Correo de verificación reenviado. Revisa tu bandeja de entrada."
              );
            } else {
              toast.error("Error al reenviar el correo de verificación.");
            }
          }
        } else {
          setLoginError("Credenciales incorrectas");
          toast.error("Credenciales incorrectas");
        }

        setIsLoading(false);
      } else {
        toast.success("Inicio de sesión exitoso");

        // Delay navigation slightly to let toast display
        setTimeout(() => {
          if (typeof afterLogin === "function") {
            afterLogin();
            setTimeout(() => {
              router.push(redirect);
            }, 100);
          } else {
            router.push(redirect);
          }
        }, 300);
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Error al iniciar sesión");
      toast.error("Error al iniciar sesión");
      setIsLoading(false);
    }
  };

  // Manejador para el enlace "Olvidé mi contraseña"
  const handleForgotPassword = (e) => {
    if (isInModal && typeof onForgotPassword === "function") {
      e.preventDefault(); // Prevenir la navegación por defecto
      onForgotPassword(); // Llamar a la función proporcionada por el padre
    }
    // Si no estamos en un modal o no hay manejador, deja que el enlace funcione normalmente
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="font-bold text-center text-2xl font-semibold mb-6">
        INICIAR SESIÓN
      </h2>

      {loginError && (
        <div className="mb-4 bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-600">{loginError}</p>
        </div>
      )}

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
          {isInModal && typeof onForgotPassword === "function" ? (
            // Si estamos en un modal, usar un botón que llame a la función proporcionada
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm font-medium text-black hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          ) : (
            // Si no estamos en un modal, usar el enlace normal
            <Link
              href="/auth/reset-password"
              className="text-sm font-medium text-black hover:underline"
              onClick={handleForgotPassword}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          )}
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

        <GoogleLoginButton callbackUrl={redirect} />

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
                href={`/auth/register${
                  redirect !== "/"
                    ? `?redirect=${encodeURIComponent(redirect)}`
                    : ""
                }`}
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
