"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signIn } from "next-auth/react";
import GoogleLoginButton from "@/components/ui/GoogleLoginButton";

export default function RegisterForm({ switchToLogin, afterRegister }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password", "");

  useEffect(() => {
    if (redirectTo.includes("/checkout")) {
      toast.info("Completa el registro para continuar con tu compra", {
        duration: 5000,
      });
    }
  }, [redirectTo]);

  // Update the onSubmit function to handle modal scenarios
const onSubmit = async (data) => {
  setIsLoading(true);

  try {
    // Registrar usuario
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Error al registrar el usuario");
    }

    // Store the email in localStorage for the success page
    localStorage.setItem("registrationEmail", data.email);
    
    // Mostrar mensaje de éxito
    toast.success("Registro exitoso. Por favor, verifica tu correo para activar tu cuenta.");
    
    // Check if we're in a modal (afterRegister callback exists)
    if (typeof afterRegister === 'function') {
      // Call the afterRegister callback to close the modal
      afterRegister();
      
      // Wait a brief moment to allow the modal to close, then redirect
      setTimeout(() => {
        router.push("/auth/register/success");
      }, 300);
    } else {
      // Direct redirect if not in a modal
      router.push("/auth/register/success");
    }
    
  } catch (error) {
    toast.error(error.message || "Error al registrar el usuario");
    console.error("Error de registro:", error);
    setIsLoading(false);
  }
};

  return (
    // Your existing JSX return...
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="font-bold text-center text-2xl mb-6">
        CREAR CUENTA
      </h2>

      {redirectTo.includes("/checkout") && (
        <div className="mb-6 bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-800">
            Completa el registro para continuar con tu compra. Todos los campos
            son necesarios para el envío de tu pedido.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Form fields remain the same */}
        <div>
          <label htmlFor="name" className="block text-sm mb-2">
            Nombre Completo
          </label>
          <input
            id="name"
            type="text"
            placeholder="Nombre completo"
            className={`w-full border border-gray-300 px-3 py-3 text-gray-900 focus:outline-none focus:border-black ${
              errors.name ? "border-red-500" : ""
            }`}
            {...register("name", {
              required: "El nombre es requerido",
              minLength: {
                value: 2,
                message: "El nombre debe tener al menos 2 caracteres",
              },
            })}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

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
          <label htmlFor="phone" className="block text-sm mb-2">
            Teléfono
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="Teléfono"
            className={`w-full border border-gray-300 px-3 py-3 text-gray-900 focus:outline-none focus:border-black ${
              errors.phone ? "border-red-500" : ""
            }`}
            {...register("phone", {
              required: "El teléfono es requerido",
              pattern: {
                value: /^\+?[0-9]{10,15}$/,
                message:
                  "Debe ingresar un número de teléfono válido (con o sin '+') entre 10 y 15 dígitos",
              },
            })}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
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

        <div>
          <label htmlFor="confirmPassword" className="block text-sm mb-2">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              className={`w-full border border-gray-300 px-3 py-3 pr-10 text-gray-900 focus:outline-none focus:border-black ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              {...register("confirmPassword", {
                required: "Debe confirmar su contraseña",
                validate: (value) =>
                  value === password || "Las contraseñas no coinciden",
              })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <FaEyeSlash size={18} />
              ) : (
                <FaEye size={18} />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="acceptTerms"
            type="checkbox"
            className={`h-4 w-4 text-black focus:ring-black border-gray-300 rounded ${
              errors.acceptTerms ? "border-red-500" : ""
            }`}
            {...register("acceptTerms", {
              required: "Debe aceptar los términos y condiciones",
            })}
          />
          <label
            htmlFor="acceptTerms"
            className="ml-2 block text-sm text-gray-700"
          >
            Acepto los{" "}
            <Link href="/terms" className="text-black hover:underline">
              Términos y Condiciones
            </Link>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="mt-1 text-sm text-red-500">
            {errors.acceptTerms.message}
          </p>
        )}

        <button type="submit" disabled={isLoading} className="w-full btn-drop">
          <span>{isLoading ? "Registrando..." : "Registrarse"}</span>
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

        <GoogleLoginButton callbackUrl={redirectTo} />

        <p className="mt-4 text-sm">
          ¿Ya tienes cuenta?{" "}
          {switchToLogin ? (
            <button
              type="button"
              onClick={switchToLogin}
              className="font-medium text-black hover:underline"
            >
              Inicia Sesión
            </button>
          ) : (
            <Link
              href={`/auth/login${
                redirectTo !== "/"
                  ? `?redirect=${encodeURIComponent(redirectTo)}`
                  : ""
              }`}
              className="font-medium text-black hover:underline"
            >
              Inicia Sesión
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}