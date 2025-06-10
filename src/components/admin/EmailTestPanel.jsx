// src/components/admin/EmailTestPanel.js
"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";

const EmailTestPanel = () => {
  const [testEmail, setTestEmail] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const emailTypes = [
    {
      id: "order-confirmation",
      name: "Confirmación de Orden",
      description: "Email que recibe el cliente al crear una orden",
      icon: "📧",
      recipient: "Cliente",
    },
    {
      id: "admin-order-notification",
      name: "Notificación de Nueva Orden",
      description: "Email que recibe el admin cuando hay una nueva orden",
      icon: "🚨",
      recipient: "Admin",
    },
    {
      id: "payment-confirmation",
      name: "Confirmación de Pago",
      description: "Email que recibe el cliente cuando se confirma el pago",
      icon: "✅",
      recipient: "Cliente",
    },
    {
      id: "admin-payment-notification",
      name: "Notificación de Pago",
      description: "Email que recibe el admin cuando se confirma un pago",
      icon: "💰",
      recipient: "Admin",
    },
    {
      id: "order-status-update",
      name: "Actualización de Estado",
      description:
        "Email cuando cambia el estado de la orden (enviado/entregado)",
      icon: "📦",
      recipient: "Cliente",
    },
    {
      id: "question-notification",
      name: "Nueva Pregunta",
      description: "Email al admin cuando un cliente hace una pregunta",
      icon: "❓",
      recipient: "Admin",
    },
    {
      id: "question-answered",
      name: "Pregunta Respondida",
      description: "Email al cliente cuando se responde su pregunta",
      icon: "💬",
      recipient: "Cliente",
    },
    {
      id: "welcome-email",
      name: "Email de Bienvenida",
      description: "Email de bienvenida para nuevos usuarios",
      icon: "👋",
      recipient: "Cliente",
    },
  ];

  const handleTest = async (testType = selectedTest) => {
    if (!testEmail) {
      toast.error("Por favor ingresa un email para la prueba");
      return;
    }

    if (!testType) {
      toast.error("Por favor selecciona un tipo de email para probar");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: testType,
          testEmail: testEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
        if (data.success) {
          toast.success(`Email de prueba enviado a ${testEmail}`);
        } else {
          toast.error(`Error: ${data.message}`);
        }
      } else {
        throw new Error(data.error || "Error en la solicitud");
      }
    } catch (error) {
      console.error("Error testing email:", error);
      toast.error("Error enviando email de prueba");
      setResults({
        success: false,
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAll = () => {
    handleTest("all");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <EnvelopeIcon className="h-6 w-6 mr-2 text-indigo-600" />
          Test de Emails
        </h2>
        <p className="text-gray-600 mt-1">
          Prueba el sistema de emails para verificar que funciona correctamente
        </p>
      </div>

      {/* Configuración del Test */}
      <div className="space-y-4 mb-6">
        <div>
          <label
            htmlFor="testEmail"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email de Prueba
          </label>
          <input
            type="email"
            id="testEmail"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="tu-email@gmail.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Los emails de prueba se enviarán a esta dirección
          </p>
        </div>

        <div>
          <label
            htmlFor="testType"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tipo de Email a Probar
          </label>
          <select
            id="testType"
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecciona un tipo de email...</option>
            {emailTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.name} ({type.recipient})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={() => handleTest()}
          disabled={isLoading || !testEmail || !selectedTest}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Enviando...
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4 mr-2" />
              Probar Email Seleccionado
            </>
          )}
        </button>

        <button
          onClick={handleTestAll}
          disabled={isLoading || !testEmail}
          className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Enviando...
            </>
          ) : (
            <>
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              Probar TODOS los Emails
            </>
          )}
        </button>
      </div>

      {/* Lista de Tipos de Email */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Tipos de Email Disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {emailTypes.map((type) => (
            <div
              key={type.id}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                selectedTest === type.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedTest(type.id)}
            >
              <div className="flex items-start">
                <span className="text-2xl mr-3">{type.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{type.name}</h4>
                  <p className="text-sm text-gray-600">{type.description}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                      type.recipient === "Cliente"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    Para: {type.recipient}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resultados */}
      {results && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Resultados del Test
          </h3>

          {results.results ? (
            // Resultados de test múltiple
            <div className="space-y-3">
              {results.results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center p-3 rounded-lg ${
                    result.result.success
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {result.result.success ? (
                    <CheckCircleIcon className="h-5 w-5 mr-3" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 mr-3" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">
                      {emailTypes.find((t) => t.id === result.type)?.name ||
                        result.type}
                    </div>
                    <div className="text-sm">
                      {result.result.success
                        ? "Enviado correctamente"
                        : result.result.error}
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mt-4">
                <div className="flex items-center">
                  <InformationCircleIcon className="h-5 w-5 mr-3" />
                  <span className="font-medium">
                    Resumen:{" "}
                    {results.results.filter((r) => r.result.success).length} de{" "}
                    {results.results.length} emails enviados correctamente
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Resultado de test individual
            <div
              className={`flex items-center p-4 rounded-lg ${
                results.success
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {results.success ? (
                <CheckCircleIcon className="h-6 w-6 mr-3" />
              ) : (
                <XCircleIcon className="h-6 w-6 mr-3" />
              )}
              <div>
                <div className="font-medium">
                  {results.success
                    ? "Email enviado correctamente"
                    : "Error enviando email"}
                </div>
                <div className="text-sm mt-1">{results.message}</div>
                {results.result?.messageId && (
                  <div className="text-xs mt-1">
                    ID del mensaje: {results.result.messageId}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Información Adicional */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-gray-900 mb-2">ℹ️ Información</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Los emails de prueba usan datos ficticios pero realistas</li>
          <li>• Verifica tu bandeja de entrada y carpeta de spam</li>
          <li>• Los emails se envían desde la configuración de Resend</li>
          <li>• Solo administradores pueden ejecutar estas pruebas</li>
        </ul>
      </div>
    </div>
  );
};

export default EmailTestPanel;
