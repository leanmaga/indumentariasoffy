// context/AuthContext.js - VERSIÓN ACTUALIZADA
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Crear contexto
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Actualizamos el estado de carga basado en NextAuth
  useEffect(() => {
    if (status !== "loading") {
      setLoading(false);
    }
  }, [status]);

  // Función para iniciar sesión - ahora usa NextAuth
  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        toast.error("Credenciales incorrectas");
        setLoading(false);
        return { success: false, error: result.error };
      }

      toast.success("Inicio de sesión exitoso");

      // Redirigir según el rol del usuario
      if (session?.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }

      return { success: true };
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      toast.error(error.message || "Error al iniciar sesión");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión - ahora usa NextAuth
  const logout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Sesión cerrada correctamente");
      router.push("/auth/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  // Valor del contexto - ahora con datos de NextAuth
  const value = {
    user: session?.user || null,
    loading: loading || status === "loading",
    login,
    logout,
    // Estos valores se calculan directamente desde la sesión de NextAuth
    isAuthenticated: !!session?.user,
    isAdmin: session?.user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
