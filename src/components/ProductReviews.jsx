// src/components/ProductReviews.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import StarRating from "./ui/StarRating";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const ProductReviews = ({ productId }) => {
  const { data: session, status } = useSession();

  // Estados principales
  const [questions, setQuestions] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("questions");
  const [canQuestion, setCanQuestion] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const [permissions, setPermissions] = useState({});

  // Estados de formularios
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questionForm, setQuestionForm] = useState({ comment: "" });
  const [ratingForm, setRatingForm] = useState({ rating: 0, comment: "" });

  // Estados de estadísticas
  const [ratingStats, setRatingStats] = useState({
    average: 0,
    total: 0,
    distribution: [0, 0, 0, 0, 0],
  });
  const [counts, setCounts] = useState({
    questions: 0,
    ratings: 0,
    total: 0,
  });

  // Estados para funcionalidades
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState("all");

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  // Función para obtener reviews
  const fetchReviews = async () => {
    try {
      if (!productId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/products/${productId}/reviews`);
      const data = await response.json();

      if (data.success) {
        setQuestions(data.reviews.questions || []);
        setRatings(data.reviews.ratings || []);
        setRatingStats(
          data.ratingStats || {
            average: 0,
            total: 0,
            distribution: [0, 0, 0, 0, 0],
          }
        );
        setCounts(data.counts || { questions: 0, ratings: 0, total: 0 });
      } else {
        toast.error("Error al cargar las reseñas");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Error al cargar las reseñas");
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar permisos
  const checkPermissions = async () => {
    if (!isAuthenticated || !productId) return;

    try {
      const response = await fetch(
        `/api/products/${productId}/reviews/can-review`
      );
      const data = await response.json();

      if (data.success) {
        setCanQuestion(data.canQuestion);
        setCanRate(data.canRate);
        setPermissions(data.reasons || {});
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
    }
  };

  // Effects
  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  useEffect(() => {
    if (isAuthenticated && productId && !isLoading) {
      checkPermissions();
    } else if (status === "unauthenticated") {
      setCanQuestion(false);
      setCanRate(false);
      setPermissions({});
    }
  }, [isAuthenticated, status, productId, isLoading]);

  const handleSubmitQuestion = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para hacer una pregunta");
      return;
    }

    if (questionForm.comment.trim().length < 10) {
      toast.error("La pregunta debe tener al menos 10 caracteres");
      return;
    }

    setSubmitting(true);
    try {
      // Primero guardamos la pregunta
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "question",
          comment: questionForm.comment.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Ahora enviamos la notificación por email al administrador
        try {
          // Necesitamos obtener la información del producto para el email
          const productResponse = await fetch(`/api/products/${productId}`);
          const productData = await productResponse.json();

          if (productData.success) {
            const emailData = {
              senderName: session?.user?.name || "Usuario",
              recipientName: "Administrador",
              recipientEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
              productId: productId,
              productName: productData.product.name,
              productImage:
                productData.product.images?.[0] || "/placeholder.jpg",
              message: questionForm.comment.trim(),
              messageType: "question",
            };

            // Enviar email de notificación
            await fetch("/api/emails/send-message-notification", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(emailData),
            });
          }
        } catch (emailError) {
          console.error("Error al enviar notificación por email:", emailError);
          // No mostramos error al usuario porque la pregunta sí se guardó
        }

        toast.success(
          "Pregunta enviada con éxito. Recibirás una notificación cuando sea respondida."
        );
        setQuestionForm({ comment: "" });
        setShowQuestionForm(false);
        await fetchReviews();
        await checkPermissions();
      } else {
        toast.error(data.error || "Error al enviar la pregunta");
      }
    } catch (error) {
      console.error("Error submitting question:", error);
      toast.error("Error al enviar la pregunta");
    } finally {
      setSubmitting(false);
    }
  };

  // Función para enviar calificación
  const handleSubmitRating = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para calificar");
      return;
    }

    if (ratingForm.rating === 0) {
      toast.error("Por favor selecciona una calificación");
      return;
    }

    if (ratingForm.comment.trim().length < 10) {
      toast.error("El comentario debe tener al menos 10 caracteres");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "rating",
          rating: ratingForm.rating,
          comment: ratingForm.comment.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Calificación enviada con éxito");
        setRatingForm({ rating: 0, comment: "" });
        setShowRatingForm(false);
        await fetchReviews();
        await checkPermissions();
      } else {
        toast.error(data.error || "Error al enviar la calificación");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Error al enviar la calificación");
    } finally {
      setSubmitting(false);
    }
  };

  // Función para marcar como útil
  const markHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para votar");
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        await fetchReviews();
        toast.success("¡Gracias por tu voto!");
      } else {
        toast.error(data.error || "Error al procesar tu voto");
      }
    } catch (error) {
      console.error("Error marking helpful:", error);
      toast.error("Error al procesar tu voto");
    }
  };

  // Función para toggle expandir
  const toggleExpanded = (reviewId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedItems(newExpanded);
  };

  // Filtros
  const filteredQuestions = questions.filter(
    (q) =>
      searchTerm === "" ||
      q.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRatings = ratings.filter((r) => {
    const matchesSearch =
      searchTerm === "" ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      ratingFilter === "all" || r.rating === parseInt(ratingFilter);

    return matchesSearch && matchesFilter;
  });

  // Renderizar botones de acción
  const renderQuestionButton = () => {
    if (isLoading) {
      return (
        <div className="text-center py-2">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="text-center">
          <p className="text-gray-600 mb-3 text-sm">
            Inicia sesión para hacer una pregunta sobre este producto
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      );
    }

    if (permissions.question === "already_asked") {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-blue-800 text-sm">
            Ya has hecho una pregunta sobre este producto
          </p>
        </div>
      );
    }

    if (canQuestion) {
      return (
        <button
          onClick={() => setShowQuestionForm(true)}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Hacer una pregunta
        </button>
      );
    }

    return null;
  };

  const renderRatingButton = () => {
    if (isLoading) {
      return (
        <div className="text-center py-2">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="text-center">
          <p className="text-gray-600 mb-3 text-sm">
            Inicia sesión para calificar este producto
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      );
    }

    if (permissions.rating === "already_rated") {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-green-800 text-sm">
            Ya has calificado este producto
          </p>
        </div>
      );
    }

    if (permissions.rating === "not_purchased") {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-yellow-800 text-sm">
            Solo los clientes que compraron este producto pueden dejarlo una
            calificación con estrellas
          </p>
        </div>
      );
    }

    if (canRate) {
      return (
        <button
          onClick={() => setShowRatingForm(true)}
          className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium"
        >
          ⭐ Calificar producto
        </button>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Cargando contenido...</p>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-8" id="reviews-section">
      {/* Resumen de calificaciones */}
      {ratingStats.total > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Calificaciones de Clientes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">
                {ratingStats.average.toFixed(1)}
              </div>
              <div>
                <StarRating rating={ratingStats.average} size="md" />
                <p className="text-sm text-gray-600 mt-1">
                  {ratingStats.total}{" "}
                  {ratingStats.total === 1 ? "calificación" : "calificaciones"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm w-3">{stars}</span>
                  <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width:
                          ratingStats.total > 0
                            ? `${
                                (ratingStats.distribution[stars - 1] /
                                  ratingStats.total) *
                                100
                              }%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {ratingStats.distribution[stars - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("questions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "questions"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-1" />
            Preguntas ({counts.questions})
          </button>
          <button
            onClick={() => setActiveTab("ratings")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "ratings"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <StarIcon className="h-4 w-4 inline mr-1" />
            Calificaciones ({counts.ratings})
          </button>
        </nav>
      </div>

      {/* Buscador */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <input
          type="text"
          placeholder="Buscar en reviews..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Contenido de pestañas */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          {/* Formulario de pregunta */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Pregunta sobre este producto</h3>

            {showQuestionForm ? (
              <div className="space-y-3">
                <textarea
                  value={questionForm.comment}
                  onChange={(e) => setQuestionForm({ comment: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  placeholder="¿Qué quieres saber sobre este producto?"
                  minLength="10"
                />
                <p className="text-xs text-gray-500">
                  Mínimo 10 caracteres ({questionForm.comment.length}/10)
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSubmitQuestion}
                    disabled={
                      submitting || questionForm.comment.trim().length < 10
                    }
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    {submitting ? "Enviando..." : "Enviar pregunta"}
                  </button>
                  <button
                    onClick={() => {
                      setShowQuestionForm(false);
                      setQuestionForm({ comment: "" });
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              renderQuestionButton()
            )}
          </div>

          {/* Lista de preguntas */}
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => {
                const isExpanded = expandedItems.has(question._id);
                const shouldTruncate = question.comment.length > 200;
                const displayComment = isExpanded
                  ? question.comment
                  : shouldTruncate
                  ? question.comment.substring(0, 200) + "..."
                  : question.comment;

                return (
                  <div
                    key={question._id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {question.user?.name || "Usuario"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(question.createdAt).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      {question.verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          ✓ Cliente verificado
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 mb-3">{displayComment}</p>

                    {shouldTruncate && (
                      <button
                        onClick={() => toggleExpanded(question._id)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1 mb-3"
                      >
                        {isExpanded ? (
                          <>
                            Ver menos <ChevronUpIcon className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Ver más <ChevronDownIcon className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}

                    {question.response && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3">
                        <div className="flex items-center mb-1">
                          <CheckCircleIcon className="h-4 w-4 text-blue-600 mr-2" />
                          <p className="text-sm font-medium text-blue-900">
                            Respuesta del vendedor:
                          </p>
                        </div>
                        <p className="text-blue-800 mt-1">
                          {question.response}
                        </p>
                        {question.responseDate && (
                          <p className="text-xs text-blue-600 mt-1">
                            Respondido el{" "}
                            {new Date(question.responseDate).toLocaleDateString(
                              "es-ES"
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => markHelpful(question._id)}
                      className="text-sm text-gray-600 hover:text-indigo-600 transition-colors mt-2 flex items-center gap-1"
                      disabled={!isAuthenticated}
                    >
                      👍 ¿Te resultó útil? ({question.helpful || 0})
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>
                  {searchTerm
                    ? "No se encontraron preguntas que coincidan con tu búsqueda"
                    : "No hay preguntas todavía"}
                </p>
                {!searchTerm && (
                  <p className="text-sm">¡Sé el primero en preguntar!</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "ratings" && (
        <div className="space-y-6">
          {/* Formulario de calificación */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Califica este producto</h3>

            {showRatingForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tu calificación
                  </label>
                  <StarRating
                    rating={ratingForm.rating}
                    interactive={true}
                    onRatingChange={(rating) =>
                      setRatingForm({ ...ratingForm, rating })
                    }
                    size="lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tu comentario
                  </label>
                  <textarea
                    value={ratingForm.comment}
                    onChange={(e) =>
                      setRatingForm({ ...ratingForm, comment: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="4"
                    placeholder="Cuéntanos qué te pareció este producto..."
                    minLength="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo 10 caracteres ({ratingForm.comment.length}/10)
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleSubmitRating}
                    disabled={
                      submitting ||
                      ratingForm.rating === 0 ||
                      ratingForm.comment.trim().length < 10
                    }
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    {submitting ? "Enviando..." : "Enviar calificación"}
                  </button>
                  <button
                    onClick={() => {
                      setShowRatingForm(false);
                      setRatingForm({ rating: 0, comment: "" });
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              renderRatingButton()
            )}
          </div>

          {/* Filtro de calificaciones */}
          {ratingStats.total > 0 && (
            <div className="flex space-x-4">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todas las calificaciones</option>
                <option value="5">
                  5 estrellas ({ratingStats.distribution[4]})
                </option>
                <option value="4">
                  4 estrellas ({ratingStats.distribution[3]})
                </option>
                <option value="3">
                  3 estrellas ({ratingStats.distribution[2]})
                </option>
                <option value="2">
                  2 estrellas ({ratingStats.distribution[1]})
                </option>
                <option value="1">
                  1 estrella ({ratingStats.distribution[0]})
                </option>
              </select>
            </div>
          )}

          {/* Lista de calificaciones */}
          <div className="space-y-4">
            {filteredRatings.length > 0 ? (
              filteredRatings.map((rating) => {
                const isExpanded = expandedItems.has(rating._id);
                const shouldTruncate = rating.comment.length > 200;
                const displayComment = isExpanded
                  ? rating.comment
                  : shouldTruncate
                  ? rating.comment.substring(0, 200) + "..."
                  : rating.comment;

                return (
                  <div
                    key={rating._id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StarRating rating={rating.rating} size="sm" />
                          {rating.verified && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              ✓ Compra verificada
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-900">
                          {rating.user?.name || "Usuario"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{displayComment}</p>

                    {shouldTruncate && (
                      <button
                        onClick={() => toggleExpanded(rating._id)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1 mb-3"
                      >
                        {isExpanded ? (
                          <>
                            Ver menos <ChevronUpIcon className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Ver más <ChevronDownIcon className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => markHelpful(rating._id)}
                      className="text-sm text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
                      disabled={!isAuthenticated}
                    >
                      👍 ¿Te resultó útil? ({rating.helpful || 0})
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <StarIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>
                  {searchTerm || ratingFilter !== "all"
                    ? "No se encontraron calificaciones que coincidan con los filtros"
                    : "No hay calificaciones todavía"}
                </p>
                {!searchTerm && ratingFilter === "all" && (
                  <p className="text-sm">¡Sé el primero en calificar!</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
