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
                <a
                  href="https://wa.me/5491126907696?text=Hola%20quisiera%20saber%20si"
                  className="text-black hover:text-gray-600 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    fill="currentColor"
                    viewBox="0 0 32 32"
                    className="w-5 h-5"
                  >
                    <path d="M16.013 2.007c-7.73 0-14 6.27-14 14 0 2.469.64 4.88 1.858 6.99L2 30l7.18-1.878c2.038 1.124 4.35 1.712 6.832 1.712h.001c7.729 0 14-6.271 14-14s-6.271-14-14-14zm0 25.5c-2.175 0-4.281-.576-6.132-1.666l-.438-.254-4.263 1.115 1.137-4.146-.285-.424c-1.151-1.71-1.759-3.693-1.759-5.73 0-5.798 4.707-10.505 10.505-10.505s10.505 4.707 10.505 10.505-4.707 10.505-10.505 10.505zm5.85-7.838c-.322-.161-1.91-.94-2.205-1.047-.295-.107-.51-.161-.725.161-.214.322-.832 1.047-1.02 1.262-.187.214-.374.242-.696.08-.322-.161-1.36-.5-2.59-1.596-.957-.854-1.603-1.908-1.79-2.23-.187-.322-.02-.495.14-.656.143-.143.322-.374.482-.561.161-.187.214-.322.322-.536.107-.214.053-.401-.027-.561-.08-.161-.725-1.746-.993-2.404-.262-.632-.53-.545-.725-.545l-.619-.013c-.214 0-.561.08-.856.374-.295.295-1.12 1.095-1.12 2.667 0 1.572 1.142 3.09 1.302 3.304.161.214 2.25 3.43 5.447 4.8.762.329 1.356.526 1.82.672.764.244 1.46.21 2.009.128.613-.092 1.91-.778 2.18-1.526.268-.748.268-1.389.188-1.526-.08-.136-.295-.214-.617-.374z" />
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
