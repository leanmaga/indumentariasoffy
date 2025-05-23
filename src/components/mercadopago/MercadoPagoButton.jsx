"use client";

import { useState, useEffect, useRef } from "react";

const MercadoPagoButton = ({
  preferenceId,
  buttonText = "Pagar con MercadoPago",
  fallbackUrl,
}) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [buttonRendered, setButtonRendered] = useState(false);
  const [error, setError] = useState(null);
  const mpInstanceRef = useRef(null);
  const containerRef = useRef(null);

  // Load MercadoPago SDK
  useEffect(() => {
    if (!isSDKLoaded && !document.getElementById("mercadopago-script")) {
      const script = document.createElement("script");
      script.id = "mercadopago-script";
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;
      script.crossOrigin = "anonymous";

      script.onload = () => {
        console.log("MercadoPago SDK loaded successfully");
        setIsSDKLoaded(true);
      };
      script.onerror = (e) => {
        console.error("Error loading MercadoPago SDK:", e);
        setError("Error al cargar el SDK de MercadoPago");
      };

      document.body.appendChild(script);
    }
  }, [isSDKLoaded]);

  // Render button when SDK is loaded
  useEffect(() => {
    if (
      isSDKLoaded &&
      preferenceId &&
      !buttonRendered &&
      containerRef.current
    ) {
      try {
        const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
        if (!publicKey)
          throw new Error("MercadoPago public key is not defined");

        mpInstanceRef.current = new window.MercadoPago(publicKey, {
          locale: "es-AR",
        });

        // Clear previous container
        containerRef.current.innerHTML = "";

        mpInstanceRef.current.checkout({
          preference: { id: preferenceId },
          render: {
            container: "#mercadopago-button-container",
            label: buttonText,
          },
          theme: {
            elementsColor: "#4F46E5",
            headerColor: "#4F46E5",
          },
        });

        console.log("MercadoPago button rendered successfully");
        setButtonRendered(true);
      } catch (err) {
        console.error("Error rendering MercadoPago button:", err);
        setError(`Error al renderizar el botón de MercadoPago: ${err.message}`);
      }
    }
  }, [isSDKLoaded, preferenceId, buttonRendered, buttonText]);

  // Manual redirect fallback
  const handleManualRedirect = () => {
    if (fallbackUrl) {
      window.location.href = fallbackUrl;
    } else {
      setError("No hay URL de redirección disponible");
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}. Intenta usar el botón alternativo o recarga la página.
        </div>
      )}

      <div
        id="mercadopago-button-container"
        ref={containerRef}
        className="w-full mb-2"
      ></div>

      {(error ||
        (!isSDKLoaded && preferenceId) ||
        (!buttonRendered && preferenceId)) &&
      fallbackUrl ? (
        <button
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
          onClick={handleManualRedirect}
        >
          {buttonText} (Alternativo)
        </button>
      ) : null}
    </div>
  );
};

export default MercadoPagoButton;
