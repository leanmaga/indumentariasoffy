"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  redirectOnClose = false,
  redirectPath = "/", // Nueva prop para personalizar la ruta de redirección
  preventRedirect = false, // Nueva prop para prevenir redirección en casos especiales
}) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleClose = () => {
    // Primero cerrar el modal para evitar interferencias con posibles redirecciones
    onClose();

    // Solo redirigir si es necesario y no está prevenido explícitamente
    if (redirectOnClose && !preventRedirect) {
      setTimeout(() => {
        router.push(redirectPath);
      }, 50);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Contenedor del modal */}
      <div className="bg-white relative max-w-lg w-full max-h-[90vh] overflow-auto z-50">
        {/* Botón de cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-gray-600 hover:text-black p-2"
          aria-label="Cerrar"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Título opcional */}
        {title && (
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-center">{title}</h2>
          </div>
        )}

        {/* Contenido del modal */}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;