// src/app/admin/questions/page.js - PANEL DE ADMINISTRACIÓN
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  BellIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const AdminQuestionsPage = () => {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, answered: 0 });
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchQuestions();
    }
  }, [session, filter, currentPage]);

  // Auto-refresh para nuevas preguntas
  useEffect(() => {
    if (session?.user?.role === "admin") {
      const interval = setInterval(() => {
        fetchQuestions();
      }, 30000); // Cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: filter,
        page: currentPage.toString(),
        limit: "10",
      });

      const response = await fetch(`/api/admin/questions?${params}`);
      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions);
        setStats(data.stats);
        setTotalPages(data.pagination.total);
      } else {
        toast.error("Error al cargar preguntas");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Error al cargar preguntas");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (questionId) => {
    if (!responseText.trim() || responseText.trim().length < 10) {
      toast.error("La respuesta debe tener al menos 10 caracteres");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/questions/${questionId}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response: responseText.trim() }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Respuesta enviada. El usuario ha sido notificado por email."
        );
        setRespondingTo(null);
        setResponseText("");
        fetchQuestions(); // Refrescar lista
      } else {
        toast.error(data.error || "Error al enviar respuesta");
      }
    } catch (error) {
      console.error("Error responding:", error);
      toast.error("Error al enviar respuesta");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQuestions = questions.filter(
    (question) =>
      searchTerm === "" ||
      question.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.product?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const questionDate = new Date(date);
    const diffMs = now - questionDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora mismo";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return formatDate(date);
  };

  if (!session?.user || session.user.role !== "admin") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Acceso denegado. Solo administradores pueden ver esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y Estadísticas */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Preguntas
            </h1>
            <p className="text-gray-600 mt-1">
              Responde las preguntas de los clientes sobre productos
            </p>
          </div>

          {/* Notificación de preguntas pendientes */}
          {stats.pending > 0 && (
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 flex items-center space-x-2">
              <BellIcon className="h-5 w-5 text-orange-600" />
              <span className="text-orange-800 font-medium">
                {stats.pending} pregunta{stats.pending !== 1 ? "s" : ""}{" "}
                pendiente{stats.pending !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-blue-800">Total Preguntas</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </div>
            <div className="text-sm text-orange-800">Pendientes Respuesta</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.answered}
            </div>
            <div className="text-sm text-green-800">Respondidas</div>
          </div>
        </div>

        {/* Controles de Filtro */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar preguntas, usuarios o productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todas las preguntas</option>
            <option value="pending">
              Pendientes respuesta ({stats.pending})
            </option>
            <option value="answered">Respondidas ({stats.answered})</option>
          </select>
        </div>
      </div>

      {/* Lista de Preguntas */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Preguntas ({filteredQuestions.length})
            </h2>

            <button
              onClick={fetchQuestions}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Actualizar</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Cargando preguntas...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No se encontraron preguntas con los filtros aplicados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div
                  key={question._id}
                  className={`border rounded-lg p-4 hover:border-gray-300 transition-colors ${
                    !question.response
                      ? "border-orange-200 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  {/* Header de la pregunta */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {question.user?.name || "Usuario eliminado"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {question.user?.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          {getTimeAgo(question.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {question.verified && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Cliente verificado
                        </span>
                      )}

                      {question.response ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Respondida
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="flex items-center space-x-3 mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 relative flex-shrink-0">
                      <Image
                        src={question.product?.imageUrl || "/placeholder.jpg"}
                        alt={question.product?.title || "Producto"}
                        fill
                        sizes="48px"
                        className="object-cover rounded-md"
                        onError={(e) => {
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {question.product?.title || "Producto eliminado"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Pregunta sobre este producto
                      </div>
                    </div>
                    <button className="ml-auto text-indigo-600 hover:text-indigo-800 text-sm">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Pregunta */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Pregunta:
                    </h4>
                    <p className="text-gray-900 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      {question.comment}
                    </p>
                  </div>

                  {/* Respuesta existente o formulario */}
                  {question.response ? (
                    <div className="bg-green-50 border-l-4 border-green-400 p-3">
                      <div className="flex items-center mb-1">
                        <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-900">
                          Tu respuesta:
                        </span>
                      </div>
                      <p className="text-green-800">{question.response}</p>
                      {question.responseDate && (
                        <p className="text-xs text-green-600 mt-1">
                          Respondido el {formatDate(question.responseDate)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      {respondingTo === question._id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tu respuesta:
                            </label>
                            <textarea
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              rows="3"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Escribe tu respuesta aquí..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Mínimo 10 caracteres ({responseText.length}/10)
                            </p>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <ExclamationTriangleIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div className="text-xs text-blue-800">
                                <p className="font-medium">Recordatorio:</p>
                                <p>
                                  El cliente recibirá un email automático con tu
                                  respuesta.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRespond(question._id)}
                              disabled={
                                submitting || responseText.trim().length < 10
                              }
                              className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {submitting ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                                  Enviar Respuesta
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseText("");
                              }}
                              className="px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingTo(question._id)}
                          className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                          Responder
                        </button>
                      )}
                    </div>
                  )}

                  {/* Información adicional */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>ID: {question._id.slice(-6)}</span>
                    <div className="flex items-center space-x-4">
                      {question.helpful > 0 && (
                        <span>👍 {question.helpful} votos útiles</span>
                      )}
                      <span>{formatDate(question.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQuestionsPage;
