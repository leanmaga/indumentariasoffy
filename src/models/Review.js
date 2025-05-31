// models/Review.js - ACTUALIZADO
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
    // NUEVO: Tipo de interacción
    type: {
      type: String,
      enum: ["question", "rating"], // question = pregunta/comentario, rating = calificación con estrellas
      required: true,
    },
    // Rating es opcional ahora (solo para type: "rating")
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: function () {
        return this.type === "rating";
      },
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
    // NUEVO: Campo para respuestas del vendedor (futuro)
    response: {
      type: String,
      default: "",
    },
    responseDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ACTUALIZADO: Índice único por usuario, producto Y tipo
reviewSchema.index({ product: 1, user: 1, type: 1 }, { unique: true });

// ACTUALIZADO: Middleware para actualizar el rating del producto SOLO con reviews de tipo "rating"
reviewSchema.post("save", async function (doc) {
  // Solo actualizar stats si es una calificación con estrellas
  if (doc.type === "rating") {
    const Review = this.constructor;
    const Product = mongoose.model("Product");

    const stats = await Review.aggregate([
      {
        $match: {
          product: doc.product,
          type: "rating", // Solo incluir calificaciones con estrellas
        },
      },
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
  }
});

// ACTUALIZADO: Middleware para actualizar el rating después de eliminar
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.type === "rating") {
    const Review = mongoose.model("Review");
    const Product = mongoose.model("Product");

    const stats = await Review.aggregate([
      {
        $match: {
          product: doc.product,
          type: "rating", // Solo incluir calificaciones con estrellas
        },
      },
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
      // Si no hay más reviews con rating, resetear valores
      await Product.findByIdAndUpdate(doc.product, {
        rating: 0,
        numReviews: 0,
      });
    }
  }
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
