import { useState, useEffect, useRef } from "react";

const MercadoPagoButton = ({
  preferenceId,
  fallbackUrl,
  buttonText = "Pagar con MercadoPago",
}) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [buttonRendered, setButtonRendered] = useState(false);
  const [error, setError] = useState(null);
  const mpInstanceRef = useRef(null);
  const containerRef = useRef(null);

  // Load MercadoPago SDK
  useEffect(() => {
    // Only load the SDK once and clean up on unmount
    if (!isSDKLoaded && !document.getElementById("mercadopago-script")) {
      const script = document.createElement("script");
      script.id = "mercadopago-script";
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;
      script.crossOrigin = "anonymous"; // Add cross-origin attribute

      script.onload = () => {
        console.log("MercadoPago SDK loaded successfully");
        setIsSDKLoaded(true);
      };

      script.onerror = (e) => {
        console.error("Error loading MercadoPago SDK:", e);
        setError("Error al cargar el SDK de MercadoPago");
      };

      document.body.appendChild(script);

      return () => {
        if (document.getElementById("mercadopago-script")) {
          document.body.removeChild(script);
        }
      };
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
        // Log environment information
        console.log("Environment:", process.env.NODE_ENV);
        console.log(
          "Public Key:",
          process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
        );
        console.log("Preference ID:", preferenceId);

        // Clear previous container content
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        // Initialize MercadoPago
        const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
        if (!publicKey) {
          throw new Error("MercadoPago public key is not defined");
        }

        mpInstanceRef.current = new window.MercadoPago(publicKey, {
          locale: "es-AR", // Set to Argentina locale
        });

        // Render checkout button
        mpInstanceRef.current.checkout({
          preference: {
            id: preferenceId,
          },
          render: {
            container: "#mercadopago-button-container",
            label: buttonText,
          },
          theme: {
            elementsColor: "#4F46E5", // indigo-600 to match your styling
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
  }, [isSDKLoaded, preferenceId, buttonText, buttonRendered]);

  // Handle manual redirect as a fallback
  const handleManualRedirect = () => {
    if (fallbackUrl) {
      console.log("Redirecting manually to:", fallbackUrl);
      window.location.href = fallbackUrl;
    } else {
      setError("No hay URL de redirección disponible");
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}. Intente usar el botón de respaldo o recargar la página.
        </div>
      )}

      <div
        id="mercadopago-button-container"
        ref={containerRef}
        className="w-full mb-2"
      ></div>

      {/* Fallback button */}
      {(error ||
        (!isSDKLoaded && preferenceId) ||
        (!buttonRendered && preferenceId)) &&
        fallbackUrl && (
          <button
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
            onClick={handleManualRedirect}
          >
            {buttonText} (Alternativo)
          </button>
        )}
    </div>
  );
};

export default MercadoPagoButton;
