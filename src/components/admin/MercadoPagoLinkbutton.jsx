import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function MercadoPagoLinkButton() {
  const [isLinking, setIsLinking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar si ya está conectado
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch("/api/mercadopago/check-status");
      const data = await response.json();
      setIsConnected(data.isConnected || false);
    } catch (error) {
      console.error("Error checking connection status:", error);
    }
  };

  const handleLinkAccount = async () => {
    setIsLinking(true);

    try {
      // Generar URL de autorización
      const response = await fetch("/api/mercadopago/auth/link");
      const data = await response.json();

      if (data.authUrl) {
        // Redirigir a MercadoPago para autorización
        window.location.href = data.authUrl;
      } else {
        throw new Error("No se pudo generar el enlace de autorización");
      }
    } catch (error) {
      console.error("Error al vincular cuenta:", error);
      toast.error("Error al vincular cuenta de MercadoPago");
      setIsLinking(false);
    }
  };

  const handleUnlinkAccount = async () => {
    if (!confirm("¿Estás seguro de desvincular tu cuenta de MercadoPago?")) {
      return;
    }

    try {
      const response = await fetch("/api/mercadopago/auth/unlink", {
        method: "POST",
      });

      if (response.ok) {
        setIsConnected(false);
        toast.success("Cuenta desvinculada correctamente");
      } else {
        throw new Error("Error al desvincular");
      }
    } catch (error) {
      console.error("Error al desvincular cuenta:", error);
      toast.error("Error al desvincular cuenta");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Configuración de MercadoPago
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {isConnected
              ? "Tu cuenta está conectada y lista para recibir pagos"
              : "Conecta tu cuenta de MercadoPago para recibir pagos"}
          </p>
        </div>
        <div
          className={`h-3 w-3 rounded-full ${
            isConnected ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      </div>

      {!isConnected ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              ¿Cómo funciona?
            </h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Haz clic en "Conectar con MercadoPago"</li>
              <li>Inicia sesión en tu cuenta de MercadoPago</li>
              <li>Autoriza a IndumentariaSoffy para procesar pagos</li>
              <li>¡Listo! Tu tienda estará configurada</li>
            </ol>
          </div>

          <button
            onClick={handleLinkAccount}
            disabled={isLinking}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLinking ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <img
                  src="https://http2.mlstatic.com/static/org-img/MP3/MP_ISO_Logo.svg"
                  alt="MercadoPago"
                  className="h-6 w-6"
                />
                <span>Conectar con MercadoPago</span>
              </>
            )}
          </button>

          <div className="text-xs text-gray-500 text-center">
            <p>Al conectar, autorizas a IndumentariaSoffy a:</p>
            <ul className="mt-1 space-y-1">
              <li>• Crear preferencias de pago en tu nombre</li>
              <li>• Consultar el estado de los pagos</li>
              <li>• Recibir notificaciones de pagos</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-800 font-medium">
                Cuenta conectada correctamente
              </span>
            </div>
          </div>

          <div className="border rounded-md p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estado:</span>
              <span className="text-green-600 font-medium">Activa</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Modo:</span>
              <span className="font-medium">Producción</span>
            </div>
          </div>

          <button
            onClick={handleUnlinkAccount}
            className="w-full bg-red-50 text-red-600 py-2 px-4 rounded-md hover:bg-red-100 transition-colors text-sm"
          >
            Desvincular cuenta
          </button>
        </div>
      )}

      <div className="mt-6 pt-6 border-t">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Configuración manual (no recomendado)
        </h4>
        <p className="text-xs text-gray-600 mb-3">
          Si prefieres configurar manualmente, necesitarás proporcionar tu
          Access Token de producción.
        </p>
        <details className="text-xs">
          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
            Ver instrucciones para configuración manual
          </summary>
          <div className="mt-3 space-y-2 text-gray-600">
            <p>1. Ingresa a tu cuenta de MercadoPago</p>
            <p>2. Ve a "Tu negocio" → "Configuración" → "Credenciales"</p>
            <p>3. Selecciona "Credenciales de producción"</p>
            <p>4. Copia tu "Access Token"</p>
            <p>5. Envíalo de forma segura al desarrollador</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
              <p className="text-yellow-800">
                ⚠️ Nunca compartas tu Access Token por medios inseguros como
                WhatsApp o email
              </p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
