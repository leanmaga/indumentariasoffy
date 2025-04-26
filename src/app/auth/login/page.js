// src/app/auth/login/page.js
"use client";

import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm"; // Ajusta esta ruta según tu proyecto

function LoginContent() {
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
