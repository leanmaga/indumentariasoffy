"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

// Componente interno que usa useSearchParams
function LoginFormContent({ type = "user" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
      } else {
        toast.success(
          `Inicio de sesión exitoso como ${
            type === "admin" ? "administrador" : "usuario"
          }`
        );
        router.push(type === "admin" ? "/admin" : redirect);
      }
    } catch (error) {
      toast.error("Error al iniciar sesión");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-gray-700 mb-1">
          Correo Electrónico
        </label>
        <input
          id="email"
          type="email"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.email ? "border-red-500" : "border-gray-300"
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
        <label htmlFor="password" className="block text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.password ? "border-red-500" : "border-gray-300"
          }`}
          {...register("password", {
            required: "La contraseña es requerida",
            minLength: {
              value: 6,
              message: "La contraseña debe tener al menos 6 caracteres",
            },
          })}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-700"
          >
            Recordarme
          </label>
        </div>
        <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
      </button>

      {type === "user" && (
        <p className="text-center text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link
            href="/auth/register"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Regístrate
          </Link>
        </p>
      )}
    </form>
  );
}

// Componente principal con Suspense
const LoginForm = (props) => {
  return (
    <Suspense fallback={<div className="p-4 text-center">Cargando...</div>}>
      <LoginFormContent {...props} />
    </Suspense>
  );
};

export default LoginForm;
