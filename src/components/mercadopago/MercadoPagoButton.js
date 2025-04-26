import { useState, useEffect } from "react";

const MercadoPagoButton = ({
  preferenceId,
  fallbackUrl,
  buttonText = "Pagar con MercadoPago",
}) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [buttonRendered, setButtonRendered] = useState(false);

  // Cargar SDK de MercadoPago
  useEffect(() => {
    // Solo cargar el SDK una vez
    if (!isSDKLoaded && !document.getElementById("mercadopago-script")) {
      const script = document.createElement("script");
      script.id = "mercadopago-script";
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;

      script.onload = () => {
        setIsSDKLoaded(true);
      };

      document.body.appendChild(script);

      return () => {
        if (document.getElementById("mercadopago-script")) {
          document.body.removeChild(script);
        }
      };
    }
  }, [isSDKLoaded]);

  // Renderizar botón cuando el SDK esté cargado
  useEffect(() => {
    if (isSDKLoaded && preferenceId && !buttonRendered) {
      try {
        // Inicializar MercadoPago
        const mp = new window.MercadoPago(
          process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
          {
            locale: "es-MX", // Cambia según tu país
          }
        );

        // Limpiar contenedor previo
        const container = document.getElementById(
          "mercadopago-button-container"
        );
        if (container) {
          container.innerHTML = "";
        }

        // Renderizar botón de pago
        mp.checkout({
          preference: {
            id: preferenceId,
          },
          render: {
            container: "#mercadopago-button-container",
            label: buttonText,
          },
        });

        setButtonRendered(true);
      } catch (error) {
        console.error("Error al renderizar botón de MercadoPago:", error);
      }
    }
  }, [isSDKLoaded, preferenceId, buttonText, buttonRendered]);

  // Función para redirigir manualmente
  const handleManualRedirect = () => {
    if (fallbackUrl) {
      window.location.href = fallbackUrl;
    }
  };

  return (
    <div className="w-full">
      <div id="mercadopago-button-container" className="w-full mb-2"></div>

      {/* Botón de respaldo por si falla la carga del SDK */}
      {(!isSDKLoaded || !buttonRendered) && preferenceId && fallbackUrl && (
        <button
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
          onClick={handleManualRedirect}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default MercadoPagoButton;
