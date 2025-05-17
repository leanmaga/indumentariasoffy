"use client";
// components/Footer.js
import { useState } from "react";
import Link from "next/link";
import LegalModal from "../LegalModal";
import { legalDocuments } from "../LegalDocuments";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState({
    title: "",
    content: "",
  });

  // Función para abrir modal con el documento seleccionado
  const openDocument = (docType) => {
    if (legalDocuments[docType]) {
      setCurrentDocument({
        title: legalDocuments[docType].title,
        content: legalDocuments[docType].content,
      });
      setModalOpen(true);
    }
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <footer className="bg-black text-white py-10 sm:py-16 w-full flex justify-center items-center">
        <div className="container mx-auto px-4">
          {/* Contenedor principal: flex-col en móvil, flex-row con justify-between en tablet/desktop */}
          <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-8 mb-10 sm:mb-16">
            {/* Logo Column - Centrado en móvil, alineado a la izquierda en desktop */}
            <div className="flex flex-col items-center sm:items-start">
              <Link href="/" className="text-2xl font-bold font-drop">
                SOFFY
              </Link>
              {/* Copyright */}
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-400 font-drop">
                  © {currentYear} IndumentariaSoffy
                </p>
              </div>
            </div>

            {/* Company - Centrado en móvil */}
            <div className="flex flex-col items-center sm:items-start space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wider mb-4 font-drop">
                Compañía
              </h4>
              <ul className="flex flex-col items-center sm:items-start space-y-2">
                <li>
                  <button
                    onClick={() => openDocument("privacy")}
                    className="cursor-pointer text-sm text-gray-300 hover:text-white transition font-drop"
                  >
                    Política de Privacidad
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openDocument("terms")}
                    className="cursor-pointer text-sm text-gray-300 hover:text-white transition font-drop"
                  >
                    Términos de Uso
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openDocument("cookies")}
                    className="cursor-pointer text-sm text-gray-300 hover:text-white transition font-drop"
                  >
                    Configuración de Cookies
                  </button>
                </li>
              </ul>
            </div>

            {/* Support - Centrado en móvil */}
            <div className="flex flex-col items-center sm:items-start space-y-3">
              <h4 className="cursor-pointer text-xs font-medium uppercase tracking-wider mb-4 font-drop">
                Soporte
              </h4>
              <ul className="flex flex-col items-center sm:items-start space-y-2">
                <li>
                  <Link
                    href="/contact"
                    className="cursor-pointer text-sm text-gray-300 hover:text-white transition font-drop"
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="cursor-pointer text-sm text-gray-300 hover:text-white transition font-drop"
                  >
                    Centro de Ayuda
                  </Link>
                </li>
              </ul>
            </div>

            {/* Follow - Centrado en móvil */}
            <div className="flex flex-col items-center sm:items-start space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wider mb-4 font-drop">
                Síguenos
              </h4>
              <div className="flex justify-center sm:justify-start space-x-4">
                <a
                  href="https://www.instagram.com/indumentaria_soffy?igsh=ZWNqemd2aGM0cWNq"
                  className="text-gray-300 hover:text-white transition"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal para documentos legales */}
      <LegalModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={currentDocument.title}
        content={currentDocument.content}
      />
    </>
  );
};

export default Footer;
