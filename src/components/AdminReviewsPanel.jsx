import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import StarRating from "../ui/StarRating";
import {
  ChatBubbleLeftRightIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

const AdminReviewsPanel = () => {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    questions: 0,
    ratings: 0,
    pendingQuestions: 0,
    averageRating: 0,
    reportedCount: 0,
  });

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchReviews();
    }
  }, [session]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/reviews");
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews);
        setStats(data.stats);
      } else {
        toast.error("Error al cargar reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Error al cargar reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async () => {
    if (!selectedReview || !responseText.trim()) {
      toast.error("Por favor escribe una respuesta");
      return;
    }

    setSubmittingResponse(true);
    try {
      const response = await fetch(
        `/api/admin/reviews/${selectedReview._id}/response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response: responseText.trim() }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Respuesta enviada");
        setShowResponseModal(false);
        setSelectedReview(null);
        setResponseText("");
        fetchReviews();
      } else {
        toast.error(data.error || "Error al enviar respuesta");
      }
    } catch (error) {
      console.error("Error sending response:", error);
      toast.error("Error al enviar respuesta");
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("¿Estás seguro de eliminar esta review?")) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Review eliminada");
        fetchReviews();
      } else {
        toast.error("Error al eliminar review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Error al eliminar review");
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product?.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || review.type === typeFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "answered" && review.response) ||
      (statusFilter === "pending" &&
        !review.response &&
        review.type === "question") ||
      (statusFilter === "reported" && review.reported);

    return matchesSearch && matchesType && matchesStatus;
  });

  if (!session?.user || session.user.role !== "admin") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Acceso denegado. Solo administradores pueden ver este panel.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y Estadísticas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Panel de Reviews - Administración
        </h1>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-blue-800">Total Reviews</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.questions}
            </div>
            <div className="text-sm text-green-800">Preguntas</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.ratings}
            </div>
            <div className="text-sm text-yellow-800">Calificaciones</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingQuestions}
            </div>
            <div className="text-sm text-orange-800">Pendientes</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-purple-800">Rating Promedio</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.reportedCount}
            </div>
            <div className="text-sm text-red-800">Reportadas</div>
          </div>
        </div>

        {/* Controles de Filtro */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar reviews, usuarios o productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="question">Solo preguntas</option>
            <option value="rating">Solo calificaciones</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes respuesta</option>
            <option value="answered">Respondidas</option>
            <option value="reported">Reportadas</option>
          </select>
        </div>
      </div>

      {/* Lista de Reviews */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Reviews ({filteredReviews.length})
          </h2>

          {filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No se encontraron reviews con los filtros aplicados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div
                  key={review._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {review.type === "question" ? (
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
                      ) : (
                        <StarIcon className="h-5 w-5 text-yellow-500" />
                      )}

                      <div>
                        <div className="font-medium text-gray-900">
                          {review.user?.name || "Usuario eliminado"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {review.product?.title || "Producto eliminado"}
                        </div>
                      </div>

                      {review.type === "rating" && (
                        <StarRating rating={review.rating} size="sm" />
                      )}

                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Verificado
                        </span>
                      )}

                      {review.reported && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Reportado
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>

                      <div className="flex space-x-1">
                        {review.type === "question" && !review.response && (
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              setShowResponseModal(true);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Responder"
                          >
                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-gray-700">{review.comment}</p>
                  </div>

                  {review.response && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3">
                      <div className="flex items-center mb-1">
                        <CheckCircleIcon className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900">
                          Tu respuesta:
                        </span>
                      </div>
                      <p className="text-blue-800">{review.response}</p>
                      {review.responseDate && (
                        <p className="text-xs text-blue-600 mt-1">
                          Respondido el{" "}
                          {new Date(review.responseDate).toLocaleDateString(
                            "es-ES"
                          )}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      👍 {review.helpful || 0} votos útiles
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">
                        ID: {review._id.slice(-6)}
                      </span>

                      {review.type === "question" && !review.response && (
                        <span className="text-orange-600 font-medium">
                          ⏳ Pendiente respuesta
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Respuesta */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Responder Pregunta
                </h3>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Pregunta Original */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="font-medium text-gray-900 mb-1">
                  Pregunta de {selectedReview.user?.name}:
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Producto: {selectedReview.product?.title}
                </div>
                <p className="text-gray-800">{selectedReview.comment}</p>
              </div>

              {/* Formulario de Respuesta */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu respuesta:
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Escribe tu respuesta aquí..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo 10 caracteres ({responseText.length}/10)
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleResponse}
                    disabled={
                      submittingResponse || responseText.trim().length < 10
                    }
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submittingResponse ? "Enviando..." : "Enviar Respuesta"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPanel;
