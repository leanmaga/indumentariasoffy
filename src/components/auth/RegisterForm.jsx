"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";

const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password", "");

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
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

      // Registro exitoso, iniciar sesión automáticamente
      toast.success("Registro exitoso");

      const loginResult = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (loginResult.error) {
        toast.error("Error al iniciar sesión automáticamente");
        router.push("/auth/login");
      } else {
        router.push("/");
      }
    } catch (error) {
      toast.error(error.message || "Error al registrar el usuario");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-gray-700 mb-1">
          Nombre Completo
        </label>
        <input
          id="name"
          type="text"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.name ? "border-red-500" : "border-gray-300"
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
        <label htmlFor="phone" className="block text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          id="phone"
          type="tel"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.phone ? "border-red-500" : "border-gray-300"
          }`}
          {...register("phone", {
            required: "El teléfono es requerido",
            pattern: {
              value: /^[0-9]{10}$/,
              message:
                "Debe ingresar un número de teléfono válido de 10 dígitos",
            },
          })}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
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

      <div>
        <label htmlFor="confirmPassword" className="block text-gray-700 mb-1">
          Confirmar Contraseña
        </label>
        <input
          id="confirmPassword"
          type="password"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.confirmPassword ? "border-red-500" : "border-gray-300"
          }`}
          {...register("confirmPassword", {
            required: "Debe confirmar su contraseña",
            validate: (value) =>
              value === password || "Las contraseñas no coinciden",
          })}
        />
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
          className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${
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
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-800">
            Términos y Condiciones
          </Link>
        </label>
      </div>
      {errors.acceptTerms && (
        <p className="mt-1 text-sm text-red-500">
          {errors.acceptTerms.message}
        </p>
      )}

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Registrando..." : "Registrarse"}
      </button>

      <p className="text-center text-gray-600">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/auth/login"
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Inicia Sesión
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
