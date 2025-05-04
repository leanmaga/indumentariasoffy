// context/AuthContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Crear contexto
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Cambié de 'export default' a 'export'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cargar el usuario al inicio
  useEffect(() => {
    const loadUserFromServer = async () => {
      try {
        const res = await fetch("/api/auth/me");

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error cargando usuario:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromServer();
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      setUser(data.user);
      toast.success("Inicio de sesión exitoso");

      // Redirigir según el rol del usuario
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      toast.error(error.message || "Error al iniciar sesión");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
      toast.success("Sesión cerrada correctamente");
      router.push("/auth/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  // Valor del contexto
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
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
