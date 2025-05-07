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

  return (
    <Modal isOpen={isOpen} onClose={onClose} redirectOnClose={true}>
      {view === "login" ? (
        <LoginForm
          type="user"
          switchToRegister={handleSwitchToRegister}
          afterLogin={onClose} // Pasar la función de cierre
        />
      ) : (
        <RegisterForm
          switchToLogin={handleSwitchToLogin}
          afterRegister={onClose} // Pasar la función de cierre
        />
      )}
    </Modal>
  );
};

export default AuthModal;
