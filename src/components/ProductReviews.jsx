// components/ProductReviews.jsx
"use client";

import { useState, useEffect } from "react";
import StarRating from "./ui/StarRating";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const ProductReviews = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [ratingStats, setRatingStats] = useState({
    average: 0,
    total: 0,
    distribution: [0, 0, 0, 0, 0],
  });

  useEffect(() => {
    fetchReviews();
    if (isAuthenticated) {
      checkReviewEligibility();
    }
  }, [productId, isAuthenticated]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews);
        calculateRatingStats(data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Error al cargar las reseñas");
    } finally {
      setLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      const response = await fetch(
        `/api/products/${productId}/reviews/can-review`
      );
      const data = await response.json();

      if (data.success) {
        setCanReview(data.canReview);
        setReviewEligibility(data.reason);
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error);
    }
  };

  const calculateRatingStats = (reviewsData) => {
    if (reviewsData.length === 0) return;

    const distribution = [0, 0, 0, 0, 0];
    let total = 0;

    reviewsData.forEach((review) => {
      distribution[review.rating - 1]++;
      total += review.rating;
    });

    setRatingStats({
      average: total / reviewsData.length,
      total: reviewsData.length,
      distribution,
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para dejar una reseña");
      return;
    }

    if (newReview.rating === 0) {
      toast.error("Por favor selecciona una calificación");
      return;
    }

    if (newReview.comment.trim().length < 10) {
      toast.error("El comentario debe tener al menos 10 caracteres");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReview),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Reseña publicada exitosamente");
        setNewReview({ rating: 0, comment: "" });
        fetchReviews();
        checkReviewEligibility(); // Recheck eligibility after posting
      } else {
        toast.error(data.error || "Error al publicar la reseña");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Error al publicar la reseña");
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para marcar reseñas como útiles");
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error marking review as helpful:", error);
    }
  };

  const renderReviewForm = () => {
    if (!isAuthenticated) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            Inicia sesión para dejar una reseña
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition"
          >
            Iniciar sesión
          </Link>
        </div>
      );
    }

    if (reviewEligibility === "not_purchased") {
      return (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            Solo los clientes que han comprado este producto pueden dejar una
            reseña.
          </p>
          <Link
            href={`/products/${productId}`}
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition"
          >
            Comprar ahora
          </Link>
        </div>
      );
    }

    if (reviewEligibility === "already_reviewed") {
      return (
        <div className="text-center py-4">
          <p className="text-gray-600">
            Ya has dejado una reseña para este producto.
          </p>
        </div>
      );
    }

    if (canReview) {
      return (
        <form onSubmit={handleSubmitReview}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Tu calificación
            </label>
            <StarRating
              rating={newReview.rating}
              interactive={true}
              onRatingChange={(rating) =>
                setNewReview({ ...newReview, rating })
              }
              size="lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Tu comentario
            </label>
            <textarea
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="4"
              placeholder="Comparte tu experiencia con este producto..."
              required
              minLength="10"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Publicando..." : "Publicar reseña"}
          </button>
        </form>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Cargando reseñas...</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Reseñas de Clientes</h2>

      {/* Resumen de calificaciones */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold">
              {ratingStats.average ? ratingStats.average.toFixed(1) : "0.0"}
            </div>
            <div>
              <StarRating rating={ratingStats.average} size="md" />
              <p className="text-sm text-gray-600 mt-1">
                {ratingStats.total}{" "}
                {ratingStats.total === 1 ? "reseña" : "reseñas"}
              </p>
            </div>
          </div>

          {/* Distribución de estrellas */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm w-3">{stars}</span>
                <StarRating rating={stars} size="xs" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500"
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
                <span className="text-sm text-gray-600 w-12 text-right">
                  {ratingStats.distribution[stars - 1]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario para nueva reseña */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Escribe una reseña</h3>
          {renderReviewForm()}
        </div>
      </div>

      {/* Lista de reseñas */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="border-b pb-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} size="sm" />
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Compra verificada
                      </span>
                    )}
                  </div>
                  <p className="font-medium mt-1">
                    {review.user?.name || "Usuario"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-3">{review.comment}</p>

              <button
                onClick={() => markHelpful(review._id)}
                className="text-sm text-gray-600 hover:text-indigo-600 disabled:opacity-50"
                disabled={!isAuthenticated}
              >
                ¿Te resultó útil? ({review.helpful || 0})
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">
            Aún no hay reseñas para este producto. ¡Sé el primero en dejar una!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
