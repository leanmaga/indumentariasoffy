import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";

const ReviewReportModal = ({ review, isOpen, onClose, onReported }) => {
  const { data: session } = useSession();
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reportReasons = [
    {
      id: "spam",
      label: "Spam o contenido promocional",
      description: "Contenido que parece ser promocional o repetitivo",
    },
    {
      id: "inappropriate",
      label: "Contenido inapropiado",
      description: "Lenguaje ofensivo, discriminatorio o inapropiado",
    },
    {
      id: "fake",
      label: "Review falsa",
      description: "Parece ser una review falsa o comprada",
    },
    {
      id: "offensive",
      label: "Lenguaje ofensivo",
      description: "Contiene insultos, amenazas o lenguaje agresivo",
    },
    {
      id: "irrelevant",
      label: "Contenido irrelevante",
      description: "No relacionado con el producto",
    },
    {
      id: "personal",
      label: "Información personal",
      description: "Contiene información personal o privada",
    },
    {
      id: "other",
      label: "Otro motivo",
      description: "Especifica otro motivo en el campo de abajo",
    },
  ];

  const handleSubmit = async () => {
    if (!session?.user) {
      toast.error("Debes iniciar sesión para reportar contenido");
      return;
    }

    if (!selectedReason) {
      toast.error("Por favor selecciona un motivo");
      return;
    }

    if (selectedReason === "other" && !customReason.trim()) {
      toast.error("Por favor especifica el motivo");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/reviews/${review._id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason:
            selectedReason === "other" ? customReason.trim() : selectedReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Review reportada. Nuestro equipo la revisará.");
        onReported?.();
        onClose();
        setSelectedReason("");
        setCustomReason("");
      } else {
        toast.error(data.error || "Error al reportar la review");
      }
    } catch (error) {
      console.error("Error reporting review:", error);
      toast.error("Error al reportar la review");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Reportar contenido inapropiado
                </h3>
                <p className="text-sm text-gray-600">
                  Ayúdanos a mantener la comunidad segura
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Review being reported */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {review.user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {review.user?.name || "Usuario"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString("es-ES")}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {review.comment}
                </p>
              </div>
            </div>
          </div>

          {/* Report reasons */}
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-medium text-gray-900">
              ¿Cuál es el problema con este contenido?
            </h4>

            {reportReasons.map((reason) => (
              <label
                key={reason.id}
                className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedReason === reason.id
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {reason.label}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {reason.description}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Custom reason input */}
          {selectedReason === "other" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especifica el motivo:
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Describe el problema con este contenido..."
                maxLength="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {customReason.length}/500 caracteres
              </p>
            </div>
          )}

          {/* Important note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Información importante:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>
                    Nuestro equipo revisará este reporte en menos de 24 horas
                  </li>
                  <li>
                    Los reportes falsos pueden resultar en restricciones a tu
                    cuenta
                  </li>
                  <li>
                    Solo reporta contenido que realmente viole nuestras
                    políticas
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !selectedReason ||
                (selectedReason === "other" && !customReason.trim())
              }
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Enviando..." : "Enviar reporte"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente del botón de reporte para usar en las reviews
const ReportButton = ({ review, onReported }) => {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);

  // No mostrar el botón si es la propia review del usuario
  if (session?.user?.id === review.user?._id) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-xs text-gray-500 hover:text-red-600 transition-colors flex items-center space-x-1"
        title="Reportar contenido inapropiado"
      >
        <FlagIcon className="h-3 w-3" />
        <span>Reportar</span>
      </button>

      <ReviewReportModal
        review={review}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onReported={onReported}
      />
    </>
  );
};

export { ReviewReportModal, ReportButton };
export default ReviewReportModal;
