// app/admin/reviews/page.js - PÁGINA PRINCIPAL DE ADMIN PARA REVIEWS
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import StarRating from "@/components/ui/StarRating";
import {
  StarIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const AdminReviewsPage = () => {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ratings"); // ratings, questions, all
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all"); // all, 5, 4, 3, 2, 1
  const [statusFilter, setStatusFilter] = useState("all"); // all, verified, reported
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, highest, lowest, helpful
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");

  // Estados para estadísticas
  const [stats, setStats] = useState({
    totalReviews: 0,
    totalRatings: 0,
    totalQuestions: 0,
    averageRating: 0,
    reportedCount: 0,
    verifiedCount: 0,
    ratingDistribution: [0, 0, 0, 0, 0],
  });

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchReviews();
    }
  }, [session, activeTab, ratingFilter, statusFilter, sortBy, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type:
          activeTab === "all"
            ? ""
            : activeTab === "ratings"
            ? "rating"
            : "question",
        rating: ratingFilter === "all" ? "" : ratingFilter,
        status: statusFilter,
        sort: sortBy,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(`/api/admin/reviews?${params}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews || []);
        setStats(data.stats || {});
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

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta review?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Review eliminada correctamente");
        fetchReviews();
      } else {
        toast.error(data.error || "Error al eliminar review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Error al eliminar review");
    }
  };

  const handleBulkAction = async () => {
    if (selectedReviews.size === 0) {
      toast.error("Selecciona al menos una review");
      return;
    }

    if (!bulkAction) {
      toast.error("Selecciona una acción");
      return;
    }

    if (
      !confirm(`¿Confirmas ${bulkAction} para ${selectedReviews.size} reviews?`)
    ) {
      return;
    }

    try {
      const response = await fetch("/api/admin/reviews/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: bulkAction,
          reviewIds: Array.from(selectedReviews),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Acción completada: ${data.affected} reviews afectadas`);
        setSelectedReviews(new Set());
        setBulkAction("");
        fetchReviews();
      } else {
        toast.error(data.error || "Error en la acción masiva");
      }
    } catch (error) {
      console.error("Error in bulk action:", error);
      toast.error("Error en la acción masiva");
    }
  };

  const toggleSelectReview = (reviewId) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId);
    } else {
      newSelected.add(reviewId);
    }
    setSelectedReviews(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedReviews.size === filteredReviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(filteredReviews.map((r) => r._id)));
    }
  };

  // Filtrar reviews según búsqueda
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      searchTerm === "" ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product?.title.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (review) => {
    const badges = [];

    if (review.verified) {
      badges.push(
        <span
          key="verified"
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
        >
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Verificado
        </span>
      );
    }

    if (review.reported) {
      badges.push(
        <span
          key="reported"
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
        >
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          Reportado
        </span>
      );
    }

    if (review.type === "question" && review.response) {
      badges.push(
        <span
          key="answered"
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          <ChatBubbleLeftRightIcon className="h-3 w-3 mr-1" />
          Respondida
        </span>
      );
    }

    return badges;
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Reviews y Calificaciones
            </h1>
            <p className="text-gray-600 mt-1">
              Administra las opiniones y preguntas de los productos
            </p>
          </div>

          {/* <div className="flex items-center space-x-3">
            <Link
              href="/admin/reviews/analytics"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
            >
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Analytics
            </Link>
            <Link
              href="/admin/questions"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
              Gestionar Preguntas
            </Link>
          </div> */}
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalReviews || 0}
            </div>
            <div className="text-sm text-blue-800">Total Reviews</div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.totalRatings || 0}
            </div>
            <div className="text-sm text-yellow-800">Calificaciones</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalQuestions || 0}
            </div>
            <div className="text-sm text-green-800">Preguntas</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
            </div>
            <div className="text-sm text-purple-800">Rating Promedio</div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.verifiedCount || 0}
            </div>
            <div className="text-sm text-emerald-800">Verificadas</div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.reportedCount || 0}
            </div>
            <div className="text-sm text-red-800">Reportadas</div>
          </div>
        </div>

        {/* Distribución de Calificaciones */}
        {stats.ratingDistribution &&
          stats.ratingDistribution.some((count) => count > 0) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Distribución de Calificaciones
              </h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center space-x-3">
                    <span className="text-sm w-8">{stars} ★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{
                          width:
                            stats.totalRatings > 0
                              ? `${
                                  (stats.ratingDistribution[stars - 1] /
                                    stats.totalRatings) *
                                  100
                                }%`
                              : "0%",
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {stats.ratingDistribution[stars - 1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Filtros y Controles */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Pestañas */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab("ratings");
                setCurrentPage(1);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "ratings"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <StarIcon className="h-4 w-4 inline mr-1" />
              Calificaciones ({stats.totalRatings || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab("questions");
                setCurrentPage(1);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "questions"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-1" />
              Preguntas ({stats.totalQuestions || 0})
            </button>
            <button
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "all"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Todas ({stats.totalReviews || 0})
            </button>
          </nav>
        </div>

        {/* Controles de Filtro */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por contenido, usuario o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-3">
            {activeTab === "ratings" && (
              <select
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todas las estrellas</option>
                <option value="5">5 estrellas</option>
                <option value="4">4 estrellas</option>
                <option value="3">3 estrellas</option>
                <option value="2">2 estrellas</option>
                <option value="1">1 estrella</option>
              </select>
            )}

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos los estados</option>
              <option value="verified">Solo verificadas</option>
              <option value="reported">Reportadas</option>
              <option value="pending">Pendientes respuesta</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguas</option>
              {activeTab === "ratings" && (
                <>
                  <option value="highest">Mejor calificadas</option>
                  <option value="lowest">Peor calificadas</option>
                </>
              )}
              <option value="helpful">Más útiles</option>
            </select>
          </div>
        </div>

        {/* Acciones Masivas */}
        {selectedReviews.size > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-800">
                {selectedReviews.size} reviews seleccionadas
              </span>
              <div className="flex items-center space-x-3">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-1 border border-indigo-300 rounded text-sm"
                >
                  <option value="">Seleccionar acción...</option>
                  <option value="delete">Eliminar</option>
                  <option value="mark_verified">Marcar como verificadas</option>
                  <option value="mark_reported">Marcar como reportadas</option>
                  <option value="remove_reports">Quitar reportes</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  Aplicar
                </button>
                <button
                  onClick={() => setSelectedReviews(new Set())}
                  className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Reviews */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Reviews ({filteredReviews.length})
            </h2>

            {filteredReviews.length > 0 && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedReviews.size === filteredReviews.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">
                  Seleccionar todas
                </label>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Cargando reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <StarIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No se encontraron reviews con los filtros aplicados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((review) => (
                  <div
                    key={review._id}
                    className={`border rounded-lg p-4 hover:border-gray-300 transition-colors ${
                      selectedReviews.has(review._id)
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200"
                    }`}
                  >
                    {/* Header de la review */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedReviews.has(review._id)}
                          onChange={() => toggleSelectReview(review._id)}
                          className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />

                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-600" />
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {review.user?.name || "Usuario eliminado"}
                            </span>
                            {review.type === "rating" && (
                              <StarRating rating={review.rating} size="sm" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {review.user?.email}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(review)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>

                        <div className="flex space-x-1">
                          <Link
                            href={`/products/${review.product?._id}#reviews-section`}
                            target="_blank"
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Ver en producto"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="Eliminar"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Información del producto */}
                    <div className="flex items-center space-x-3 mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 relative flex-shrink-0">
                        <Image
                          src={review.product?.imageUrl || "/placeholder.jpg"}
                          alt={review.product?.title || "Producto"}
                          fill
                          sizes="48px"
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {review.product?.title || "Producto eliminado"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {review.type === "rating"
                            ? "Calificación del producto"
                            : "Pregunta sobre el producto"}
                        </div>
                      </div>
                    </div>

                    {/* Contenido de la review */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {review.type === "rating" ? "Comentario:" : "Pregunta:"}
                      </h4>
                      <p
                        className={`${
                          review.type === "rating"
                            ? "bg-yellow-50"
                            : "bg-blue-50"
                        } p-3 rounded-lg text-gray-900`}
                      >
                        {review.comment}
                      </p>
                    </div>

                    {/* Respuesta si es pregunta */}
                    {review.type === "question" && review.response && (
                      <div className="bg-green-50 border-l-4 border-green-400 p-3">
                        <div className="flex items-center mb-1">
                          <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-900">
                            Respuesta del vendedor:
                          </span>
                        </div>
                        <p className="text-green-800">{review.response}</p>
                        {review.responseDate && (
                          <p className="text-xs text-green-600 mt-1">
                            Respondido el {formatDate(review.responseDate)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Información adicional */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>👍 {review.helpful || 0} votos útiles</span>
                        <span>ID: {review._id.slice(-6)}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Paginación */}
          {filteredReviews.length > itemsPerPage && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {[...Array(Math.ceil(filteredReviews.length / itemsPerPage))].map(
                (_, i) => (
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
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(
                      Math.ceil(filteredReviews.length / itemsPerPage),
                      currentPage + 1
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredReviews.length / itemsPerPage)
                }
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

export default AdminReviewsPage;
