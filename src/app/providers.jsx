// app/providers.jsx (VERSIÓN ACTUALIZADA)
"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <Toaster position="top-center" />
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
