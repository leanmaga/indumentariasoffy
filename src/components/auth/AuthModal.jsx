"use client";
import { useState, useEffect } from "react";
import Modal from "./Modal";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

const AuthModal = ({ isOpen, onClose, initialView = "login" }) => {
  const [view, setView] = useState(initialView);

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

  // Función para manejar el cierre después de acciones exitosas
  const handleSuccess = () => {
    // Retrasar levemente el cierre para permitir que la redirección ocurra primero
    setTimeout(() => {
      onClose();
    }, 100);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} redirectOnClose={true}>
      {view === "login" ? (
        <LoginForm
          switchToRegister={handleSwitchToRegister}
          afterLogin={handleSuccess} // Usar la nueva función
          callbackUrl="/" // Puedes personalizar la redirección después del login
        />
      ) : (
        <RegisterForm
          switchToLogin={handleSwitchToLogin}
          afterRegister={handleSuccess} // Usar la nueva función
        />
      )}
    </Modal>
  );
};

export default AuthModal;
