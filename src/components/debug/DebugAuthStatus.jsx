"use client";

// Coloca este componente en cualquier página para depurar NextAuth
import { useSession } from "next-auth/react";

export default function DebugAuthStatus() {
  const { data: session, status } = useSession();

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded shadow-lg z-50 max-w-md">
      <h3 className="text-lg font-bold mb-2">Estado de Autenticación</h3>
      <div>
        <p>
          Estado:{" "}
          <span
            className={
              status === "authenticated" ? "text-green-400" : "text-red-400"
            }
          >
            {status}
          </span>
        </p>
        {session ? (
          <div className="mt-2">
            <p>Usuario: {session.user?.name || "N/A"}</p>
            <p>Email: {session.user?.email || "N/A"}</p>
            <p>Rol: {session.user?.role || "N/A"}</p>
            <p className="text-xs mt-2">Token JWT está activo</p>
          </div>
        ) : (
          <p className="mt-2 text-yellow-400">No hay sesión activa</p>
        )}
      </div>
    </div>
  );
}
