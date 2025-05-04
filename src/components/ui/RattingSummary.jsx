// components/ui/RatingSummary.jsx
import React from "react";
import StarRating from "./StarRating";

const RatingSummary = ({
  rating = 0,
  numReviews = 0,
  size = "sm",
  showReviewCount = true,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <StarRating rating={rating} size={size} />
        {showReviewCount && numReviews > 0 && (
          <span
            className={`text-gray-600 ${
              size === "xs"
                ? "text-xs"
                : size === "sm"
                ? "text-sm"
                : "text-base"
            }`}
          >
            ({numReviews})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <StarRating rating={rating} size={size} />
      {showReviewCount && (
        <p
          className={`text-gray-600 ${
            size === "xs" ? "text-xs" : size === "sm" ? "text-sm" : "text-base"
          }`}
        >
          {numReviews === 0
            ? "Sin reseñas aún"
            : `${numReviews} ${numReviews === 1 ? "reseña" : "reseñas"}`}
        </p>
      )}
    </div>
  );
};

export default RatingSummary;
