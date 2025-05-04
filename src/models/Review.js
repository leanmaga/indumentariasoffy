// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minLength: 10,
      maxLength: 500,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    helpfulVotes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    verified: {
      type: Boolean,
      default: false, // true si el usuario compró el producto
    },
  },
  {
    timestamps: true,
  }
);

// Prevenir múltiples reviews del mismo usuario para el mismo producto
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Middleware para actualizar el rating del producto después de crear una review
reviewSchema.post("save", async function (doc) {
  const Review = this.constructor;
  const Product = mongoose.model("Product");

  const stats = await Review.aggregate([
    { $match: { product: doc.product } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(doc.product, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  }
});

// Middleware para actualizar el rating del producto después de eliminar una review
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const Review = mongoose.model("Review");
    const Product = mongoose.model("Product");

    const stats = await Review.aggregate([
      { $match: { product: doc.product } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(doc.product, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        numReviews: stats[0].numReviews,
      });
    } else {
      // Si no hay más reviews, resetear valores
      await Product.findByIdAndUpdate(doc.product, {
        rating: 0,
        numReviews: 0,
      });
    }
  }
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
