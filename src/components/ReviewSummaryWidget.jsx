import React, { useState, useEffect } from "react";
import StarRating from "./ui/StarRating";
import {
  ChevronRightIcon,
  ChatBubbleLeftIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const ReviewSummaryWidget = ({ productId, onSectionClick }) => {
  const [reviewData, setReviewData] = useState({
    ratingStats: {
      average: 0,
      total: 0,
      distribution: [0, 0, 0, 0, 0],
    },
    counts: {
      questions: 0,
      ratings: 0,
      total: 0,
    },
    recentReviews: [],
    loading: true,
  });

  useEffect(() => {
    const fetchReviewSummary = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/reviews`);
        const data = await response.json();

        if (data.success) {
          const recentRatings =
            data.reviews.ratings?.slice(0, 3).map((review) => ({
              id: review._id,
              userName: review.user?.name || "Usuario",
              rating: review.rating,
              comment:
                review.comment.length > 100
                  ? review.comment.substring(0, 100) + "..."
                  : review.comment,
              createdAt: review.createdAt,
              verified: review.verified,
            })) || [];

          setReviewData({
            ratingStats: data.ratingStats || {
              average: 0,
              total: 0,
              distribution: [0, 0, 0, 0, 0],
            },
            counts: data.counts || {
              questions: 0,
              ratings: 0,
              total: 0,
            },
            recentReviews: recentRatings,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching review summary:", error);
        setReviewData((prev) => ({ ...prev, loading: false }));
      }
    };

    if (productId) {
      fetchReviewSummary();
    }
  }, [productId]);

  const { ratingStats, counts, recentReviews, loading } = reviewData;

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Header de Calificaciones */}
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Opiniones del producto
        </h3>

        {ratingStats.total > 0 ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {ratingStats.average.toFixed(1)}
                </span>
                <StarRating rating={ratingStats.average} size="sm" />
              </div>
              <span className="text-sm text-gray-600">
                ({ratingStats.total}{" "}
                {ratingStats.total === 1 ? "calificación" : "calificaciones"})
              </span>
            </div>

            <button
              onClick={() => onSectionClick?.("ratings")}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center space-x-1"
            >
              <span>Ver todas</span>
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StarRating rating={0} size="sm" />
              <span className="text-sm text-gray-500">
                Sin calificaciones aún
              </span>
            </div>
            <button
              onClick={() => onSectionClick?.("ratings")}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center space-x-1"
            >
              <span>Sé el primero</span>
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Distribución de Estrellas Compacta */}
      {ratingStats.total > 0 && (
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="flex items-center space-x-2 text-sm">
              <span className="w-2 text-gray-600">{stars}</span>
              <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
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
              <span className="text-xs text-gray-500 w-6 text-right">
                {ratingStats.distribution[stars - 1]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Recientes */}
      {recentReviews.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Comentarios recientes
          </h4>
          {recentReviews.map((review) => (
            <div
              key={review.id}
              className="border-l-2 border-gray-100 pl-3 py-2"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <StarRating rating={review.rating} size="xs" />
                  <span className="text-xs font-medium text-gray-900">
                    {review.userName}
                  </span>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}

          <button
            onClick={() => onSectionClick?.("ratings")}
            className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 border border-indigo-200 rounded-md hover:border-indigo-300 transition-colors"
          >
            Ver todas las calificaciones ({ratingStats.total})
          </button>
        </div>
      )}

      {/* Sección de Preguntas */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">Preguntas</span>
            {counts.questions > 0 && (
              <span className="text-sm text-gray-600">
                ({counts.questions})
              </span>
            )}
          </div>

          <button
            onClick={() => onSectionClick?.("questions")}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center space-x-1"
          >
            <span>
              {counts.questions > 0 ? "Ver preguntas" : "Hacer pregunta"}
            </span>
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        {counts.questions === 0 && (
          <p className="text-xs text-gray-500 mt-2">
            ¿Tienes dudas sobre este producto? ¡Pregunta y te responderemos!
          </p>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
        <div className="text-center">
          <h4 className="text-sm font-semibold text-indigo-900 mb-1">
            ¿Ya compraste este producto?
          </h4>
          <p className="text-xs text-indigo-700 mb-3">
            Comparte tu experiencia con otros clientes
          </p>
          <button
            onClick={() => onSectionClick?.("ratings")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
          >
            ⭐ Calificar producto
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {(counts.questions > 0 || counts.ratings > 0) && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {counts.ratings}
              </div>
              <div className="text-xs text-gray-600">Calificaciones</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {counts.questions}
              </div>
              <div className="text-xs text-gray-600">Preguntas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSummaryWidget;
