// src/app/providers.jsx
"use client";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}
