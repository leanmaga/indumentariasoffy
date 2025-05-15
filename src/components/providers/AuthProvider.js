// components/providers/AuthProvider.jsx
"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider as CustomAuthProvider } from "@/context/AuthContext";

export default function AuthProvider({ children }) {
  return (
    <SessionProvider>
      <CustomAuthProvider>{children}</CustomAuthProvider>
    </SessionProvider>
  );
}
