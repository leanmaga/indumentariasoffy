// components/providers/AuthProvider.jsx
"use client";

import { SessionProvider } from "next-auth/react";
import AuthContextProvider from "@/context/AuthContext";

export default function AuthProvider({ children }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}
