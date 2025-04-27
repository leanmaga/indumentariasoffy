"use client";

import { useState, useEffect } from "react";

const MercadoPagoButton = ({
  preferenceId,
  fallbackUrl,
  buttonText = "Pagar con MercadoPago",
}) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [buttonRendered, setButtonRendered] = useState(false);
  const [mpError, setMpError] = useState(null);

  // Cargar SDK de MercadoPago
  useEffect(() => {
    if (!isSDKLoaded && !document.getElementById("mercadopago-script")) {
      const script = document.createElement("script");
      script.id = "mercadopago-script";
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;

      script.onload = () => {
        console.log("MercadoPago SDK cargado correctamente");
        setIsSDKLoaded(true);
      };

      script.onerror = (error) => {
        console.error("Error al cargar el SDK de MercadoPago:", error);
        setMpError("Error al cargar el SDK de MercadoPago");
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
        console.log(
          "Intentando renderizar botón de MercadoPago con preferenceId:",
          preferenceId
        );

        const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
        if (!publicKey) {
          console.error("La clave pública de MercadoPago no está configurada");
          setMpError("La clave pública de MercadoPago no está configurada");
          return;
        }

        // Verificar que window.MercadoPago exista
        if (!window.MercadoPago) {
          console.error("El objeto MercadoPago no está disponible");
          setMpError("El SDK de MercadoPago no se cargó correctamente");
          return;
        }

        // Inicializar MercadoPago
        const mp = new window.MercadoPago(publicKey, {
          locale: "es-AR", // Cambiado a es-AR para Argentina
        });

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
          theme: {
            elementsColor: "#4F46E5", // Color indigo-600
            headerColor: "#4F46E5", // Color indigo-600
          },
        });

        console.log("Botón de MercadoPago renderizado correctamente");
        setButtonRendered(true);
      } catch (error) {
        console.error("Error al renderizar botón de MercadoPago:", error);
        setMpError(`Error al renderizar botón: ${error.message}`);
      }
    }
  }, [isSDKLoaded, preferenceId, buttonText, buttonRendered]);

  // Función para redirigir manualmente
  const handleManualRedirect = () => {
    if (fallbackUrl) {
      console.log("Redirigiendo manualmente a:", fallbackUrl);
      window.location.href = fallbackUrl;
    } else {
      console.error("No hay URL de fallback configurada");
    }
  };

  // Si hay un error, mostrar un botón de respaldo
  if (mpError) {
    console.log("Mostrando botón de respaldo debido a error:", mpError);
    return (
      <div className="w-full">
        <p className="text-red-500 text-sm mb-2">{mpError}</p>
        {fallbackUrl && (
          <button
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
            onClick={handleManualRedirect}
          >
            {buttonText}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div id="mercadopago-button-container" className="w-full mb-2"></div>

      {/* Botón de respaldo siempre visible para mayor seguridad */}
      {fallbackUrl && (
        <button
          className={`w-full mt-4 ${
            buttonRendered
              ? "bg-white border border-indigo-600 text-indigo-600 hover:bg-gray-50"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          } py-3 px-4 rounded-lg transition flex items-center justify-center`}
          onClick={handleManualRedirect}
        >
          {buttonRendered ? "Ir a MercadoPago manualmente" : buttonText}
        </button>
      )}
    </div>
  );
};

export default MercadoPagoButton;
