// components/ui/StarRating.jsx
"use client";

import React from "react";

const StarRating = ({
  rating = 0,
  totalStars = 5,
  size = "sm",
  showCount = false,
  numReviews = 0,
  interactive = false,
  onRatingChange = () => {},
  className = "",
}) => {
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  const handleStarClick = (starIndex) => {
    if (interactive) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(totalStars)].map((_, index) => {
        const isFullStar = index < Math.floor(rating);
        const isPartialStar = index === Math.floor(rating) && rating % 1 !== 0;
        const partialFill = rating % 1;

        return (
          <div
            key={index}
            className={`relative ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => handleStarClick(index)}
          >
            {/* Estrella vacía */}
            <svg
              className={`${sizes[size]} text-gray-300 fill-current`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>

            {/* Estrella llena */}
            {(isFullStar || isPartialStar) && (
              <svg
                className={`${sizes[size]} text-yellow-400 fill-current absolute top-0 left-0`}
                viewBox="0 0 20 20"
                style={{
                  clipPath: isPartialStar
                    ? `inset(0 ${(1 - partialFill) * 100}% 0 0)`
                    : "none",
                }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </div>
        );
      })}

      {showCount && numReviews > 0 && (
        <span
          className={`text-gray-500 ml-1 ${
            size === "xs"
              ? "text-xs"
              : size === "sm"
              ? "text-sm"
              : size === "md"
              ? "text-base"
              : "text-lg"
          }`}
        >
          ({numReviews.toLocaleString()})
        </span>
      )}
    </div>
  );
};

export default StarRating;
