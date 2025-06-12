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
  const [isLoading, setIsLoading] = useState(false);
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
        console.log("✅ MercadoPago SDK cargado correctamente");
        setIsSDKLoaded(true);
      };

      script.onerror = (e) => {
        console.error("❌ Error loading MercadoPago SDK:", e);
        setError("Error al cargar el SDK de MercadoPago");
      };

      document.body.appendChild(script);
    } else if (window.MercadoPago) {
      setIsSDKLoaded(true);
    }
  }, [isSDKLoaded]);

  // Render button when SDK is loaded
  useEffect(() => {
    if (
      isSDKLoaded &&
      preferenceId &&
      !buttonRendered &&
      containerRef.current &&
      window.MercadoPago
    ) {
      try {
        const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

        if (!publicKey) {
          throw new Error("MercadoPago public key no está configurada");
        }

        console.log("🔧 Inicializando MercadoPago con:", {
          publicKey: publicKey.substring(0, 20) + "...",
          preferenceId,
        });

        // Crear instancia de MercadoPago
        mpInstanceRef.current = new window.MercadoPago(publicKey, {
          locale: "es-AR",
        });

        // Limpiar contenedor anterior
        containerRef.current.innerHTML = "";

        // Renderizar el botón
        mpInstanceRef.current.checkout({
          preference: {
            id: preferenceId,
          },
          render: {
            container: "#mercadopago-button-container",
            label: buttonText,
          },
          theme: {
            elementsColor: "#4F46E5",
            headerColor: "#4F46E5",
          },
          // 🆕 Agregar callbacks para mejor control
          callbacks: {
            onSubmit: () => {
              console.log("🔄 Redirigiendo a MercadoPago...");
              setIsLoading(true);
              return true;
            },
            onReady: () => {
              console.log("✅ Botón de MercadoPago listo");
              setButtonRendered(true);
            },
            onError: (error) => {
              console.error("❌ Error en MercadoPago checkout:", error);
              setError("Error al procesar el pago");
              setIsLoading(false);
            },
          },
        });

        setButtonRendered(true);
      } catch (err) {
        console.error("❌ Error rendering MercadoPago button:", err);
        setError(`Error al renderizar el botón: ${err.message}`);
      }
    }
  }, [isSDKLoaded, preferenceId, buttonRendered, buttonText]);

  // Manual redirect fallback
  const handleManualRedirect = () => {
    if (fallbackUrl) {
      console.log("🔄 Redirigiendo manualmente a:", fallbackUrl);
      setIsLoading(true);
      window.location.href = fallbackUrl;
    } else {
      setError("No hay URL de redirección disponible");
    }
  };

  // Si hay error o no funciona el SDK, mostrar botón alternativo
  const showFallbackButton =
    error ||
    (!isSDKLoaded && preferenceId) ||
    (!buttonRendered && preferenceId && isSDKLoaded);

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          <p className="font-medium">Error de pago:</p>
          <p>{error}</p>
          <p className="mt-1 text-xs">
            Intenta usar el botón alternativo o recarga la página.
          </p>
        </div>
      )}

      {/* Loading state */}
      {!isSDKLoaded && (
        <div className="w-full bg-gray-100 animate-pulse rounded-lg py-3 px-4 text-center text-gray-500">
          Cargando MercadoPago...
        </div>
      )}

      {/* Contenedor del botón de MercadoPago */}
      <div
        id="mercadopago-button-container"
        ref={containerRef}
        className="w-full mb-2"
        style={{ minHeight: isSDKLoaded ? "48px" : "0" }}
      ></div>

      {/* Botón alternativo/fallback */}
      {showFallbackButton && fallbackUrl && (
        <button
          className={`w-full py-3 px-4 rounded-lg transition flex items-center justify-center font-medium ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          onClick={handleManualRedirect}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Redirigiendo...
            </>
          ) : (
            <>💳 {buttonText} (Alternativo)</>
          )}
        </button>
      )}

      {/* Debug info en desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <p>
            Debug: SDK={isSDKLoaded ? "✅" : "❌"} | Button=
            {buttonRendered ? "✅" : "❌"} | Preference=
            {preferenceId ? "✅" : "❌"}
          </p>
          {preferenceId && <p>Preference ID: {preferenceId}</p>}
          {fallbackUrl && (
            <p>Fallback URL: {fallbackUrl.substring(0, 50)}...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MercadoPagoButton;
