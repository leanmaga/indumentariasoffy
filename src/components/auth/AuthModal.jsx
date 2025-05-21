"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ResetPasswordPage from "@/app/auth/reset-password/page";

const AuthModal = ({ isOpen, onClose, initialView = "login" }) => {
  const [view, setView] = useState(initialView);
  const router = useRouter();

  // Actualiza la vista cuando cambia initialView
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [initialView, isOpen]);

  // Funciones para cambiar entre formularios
  const handleSwitchToLogin = () => {
    setView("login");
  };

  const handleSwitchToRegister = () => {
    setView("register");
  };

  // Nueva función para cambiar a recuperación de contraseña
  const handleSwitchToResetPassword = () => {
    setView("reset-password");
  };

  // Función para manejar el cierre después de acciones exitosas
  const handleSuccess = () => {
      onClose();
  };

  // Determinar si debemos prevenir la redirección al cerrar el modal
  const preventRedirect = view === "reset-password";

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      redirectOnClose={true} 
      preventRedirect={preventRedirect}
    >
      {view === "login" && (
        <LoginForm
          switchToRegister={handleSwitchToRegister}
          afterLogin={handleSuccess}
          onForgotPassword={handleSwitchToResetPassword}
          isInModal={true}
          callbackUrl="/"
        />
      )}
      
      {view === "register" && (
        <RegisterForm
          switchToLogin={handleSwitchToLogin}
          afterRegister={handleSuccess}
        />
      )}
      
      {view === "reset-password" && (
        <ResetPasswordPage 
          isInModal={true} 
          onBackToLogin={handleSwitchToLogin}
          afterSubmit={() => {
            // Cerrar el modal después del envío del correo de recuperación
            onClose();
            // Opcional: Redirigir si es necesario
            // router.push("/");
          }}
        />
      )}
    </Modal>
  );
};

export default AuthModal;