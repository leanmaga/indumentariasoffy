// models/Review.js - MODELO ACTUALIZADO CON CAMPOS DE REPORTE
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
    // Tipo de interacción
    type: {
      type: String,
      enum: ["question", "rating"],
      required: true,
    },
    // Rating es opcional (solo para type: "rating")
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
    // Campo para respuestas del vendedor (para preguntas)
    response: {
      type: String,
      default: "",
    },
    responseDate: {
      type: Date,
    },
    // 🆕 CAMPOS PARA SISTEMA DE REPORTES
    reported: {
      type: Boolean,
      default: false,
    },
    reportedAt: {
      type: Date,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reportReason: {
      type: String,
      enum: [
        "spam",
        "inappropriate",
        "fake",
        "offensive",
        "irrelevant",
        "personal",
        "other",
        "",
      ],
      default: "",
    },
    reportDetails: {
      type: String,
      maxLength: 500,
    },
    // 🆕 CAMPOS PARA MODERACIÓN
    moderated: {
      type: Boolean,
      default: false,
    },
    moderatedAt: {
      type: Date,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    moderationAction: {
      type: String,
      enum: ["approved", "hidden", "edited", "deleted", ""],
      default: "",
    },
    // 🆕 CAMPOS ADICIONALES
    visible: {
      type: Boolean,
      default: true, // false si está oculta por moderación
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    originalComment: {
      type: String, // Guardar comentario original si se edita
    },
    // Metadatos adicionales
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Índice único por usuario, producto Y tipo
reviewSchema.index({ product: 1, user: 1, type: 1 }, { unique: true });

// Índices para búsquedas de admin
reviewSchema.index({ type: 1, createdAt: -1 });
reviewSchema.index({ reported: 1, createdAt: -1 });
reviewSchema.index({ verified: 1, createdAt: -1 });
reviewSchema.index({ rating: 1, createdAt: -1 });
reviewSchema.index({ helpful: -1, createdAt: -1 });

// Middleware para actualizar el rating del producto SOLO con reviews de tipo "rating" y visibles
reviewSchema.post("save", async function (doc) {
  // Solo actualizar stats si es una calificación con estrellas y está visible
  if (doc.type === "rating" && doc.visible) {
    await updateProductStats(doc.product);
  }
});

// Middleware para actualizar el rating después de eliminar
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.type === "rating") {
    await updateProductStats(doc.product);
  }
});

// Middleware para actualizar stats cuando cambia visibilidad
reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc && doc.type === "rating") {
    await updateProductStats(doc.product);
  }
});

// Función helper para actualizar estadísticas del producto
async function updateProductStats(productId) {
  try {
    const Review = mongoose.model("Review");
    const Product = mongoose.model("Product");

    const stats = await Review.aggregate([
      {
        $match: {
          product: productId,
          type: "rating",
          visible: true, // Solo contar reviews visibles
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
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        numReviews: stats[0].numReviews,
      });
    } else {
      // Si no hay más reviews visibles, resetear valores
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0,
      });
    }
  } catch (error) {
    console.error("Error updating product stats:", error);
  }
}

// 🆕 MÉTODOS DEL MODELO

// Método para reportar una review
reviewSchema.methods.report = function (reason, details, reportedBy) {
  this.reported = true;
  this.reportedAt = new Date();
  this.reportedBy = reportedBy;
  this.reportReason = reason;
  this.reportDetails = details;
  return this.save();
};

// Método para quitar reporte
reviewSchema.methods.unreport = function () {
  this.reported = false;
  this.reportedAt = undefined;
  this.reportedBy = undefined;
  this.reportReason = "";
  this.reportDetails = undefined;
  return this.save();
};

// Método para moderar
reviewSchema.methods.moderate = function (action, moderatedBy) {
  this.moderated = true;
  this.moderatedAt = new Date();
  this.moderatedBy = moderatedBy;
  this.moderationAction = action;

  // Ajustar visibilidad según la acción
  if (action === "hidden" || action === "deleted") {
    this.visible = false;
  } else if (action === "approved") {
    this.visible = true;
    this.reported = false; // Quitar reporte si se aprueba
  }

  return this.save();
};

// Método para editar comentario
reviewSchema.methods.editComment = function (newComment, editedBy) {
  if (!this.originalComment) {
    this.originalComment = this.comment; // Guardar original
  }
  this.comment = newComment;
  this.edited = true;
  this.editedAt = new Date();
  return this.save();
};

// Método estático para obtener estadísticas de moderación
reviewSchema.statics.getModerationStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        reported: { $sum: { $cond: ["$reported", 1, 0] } },
        moderated: { $sum: { $cond: ["$moderated", 1, 0] } },
        hidden: { $sum: { $cond: [{ $eq: ["$visible", false] }, 1, 0] } },
        verified: { $sum: { $cond: ["$verified", 1, 0] } },
      },
    },
  ]);

  return (
    stats[0] || {
      total: 0,
      reported: 0,
      moderated: 0,
      hidden: 0,
      verified: 0,
    }
  );
};

// Método estático para buscar reviews con filtros avanzados
reviewSchema.statics.findWithFilters = function (filters = {}) {
  const query = this.find();

  // Aplicar filtros
  if (filters.type) query.where("type").equals(filters.type);
  if (filters.rating) query.where("rating").equals(filters.rating);
  if (filters.verified !== undefined)
    query.where("verified").equals(filters.verified);
  if (filters.reported !== undefined)
    query.where("reported").equals(filters.reported);
  if (filters.visible !== undefined)
    query.where("visible").equals(filters.visible);
  if (filters.product) query.where("product").equals(filters.product);
  if (filters.user) query.where("user").equals(filters.user);

  // Filtros de fecha
  if (filters.dateFrom) query.where("createdAt").gte(filters.dateFrom);
  if (filters.dateTo) query.where("createdAt").lte(filters.dateTo);

  // Búsqueda por texto
  if (filters.search) {
    query.where("comment").regex(new RegExp(filters.search, "i"));
  }

  return query;
};

// Virtual para verificar si puede ser editada
reviewSchema.virtual("canEdit").get(function () {
  const daysSinceCreated = Math.floor(
    (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)
  );
  return daysSinceCreated <= 7; // Editable por 7 días
});

// Virtual para obtener estado de moderación
reviewSchema.virtual("moderationStatus").get(function () {
  if (this.reported && !this.moderated) return "pending_moderation";
  if (this.moderated && this.moderationAction === "approved") return "approved";
  if (this.moderated && this.moderationAction === "hidden") return "hidden";
  if (!this.visible) return "hidden";
  return "active";
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
