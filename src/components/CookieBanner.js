// components/CookieBanner.js
"use client";
import { useState, useEffect } from "react";

const CookieBanner = ({ onOpenCookiesSettings, onAccept }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Comprobar si el usuario ya ha aceptado las cookies
    const cookiesAccepted = localStorage.getItem("cookiesAccepted");

    // Si no las ha aceptado, mostrar el banner
    if (!cookiesAccepted) {
      // Pequeño retraso para que no aparezca inmediatamente al cargar la página
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookiesAccepted", "all");
    localStorage.setItem("cookiesAcceptedAt", new Date().toISOString());
    setIsVisible(false);

    if (onAccept) {
      onAccept("all");
    }
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("cookiesAccepted", "essential");
    localStorage.setItem("cookiesAcceptedAt", new Date().toISOString());
    setIsVisible(false);

    if (onAccept) {
      onAccept("essential");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white p-4 shadow-lg border-t">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2 font-sora-regular">
              Cookies y Privacidad
            </h3>
            <p className="text-sm text-gray-600 font-sora-regular">
              Utilizamos cookies propias y de terceros para mejorar tu
              experiencia en nuestra web. Puedes aceptar todas las cookies, solo
              las esenciales o configurar tus preferencias.
              <button
                onClick={onOpenCookiesSettings}
                className="text-indigo-500 underline ml-1 font-semibold"
              >
                Más información
              </button>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAcceptEssential}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none font-sora-regular"
            >
              Solo esenciales
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none font-sora-regular"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
