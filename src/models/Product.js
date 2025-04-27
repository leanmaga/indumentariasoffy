import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Por favor proporcione un título"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Por favor proporcione un precio"],
      min: [0, "El precio no puede ser negativo"],
    },
    stock: {
      type: Number,
      required: [true, "Por favor proporcione el stock"],
      min: [0, "El stock no puede ser negativo"],
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Por favor proporcione una categoría"],
      enum: ["ropa", "electronica", "hogar", "deporte", "calzado", "otros"],
      default: "otros",
    },
    // Nuevos campos para productos de tipo calzado
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    // Variantes para combinaciones de talle y color con stock individual
    variants: {
      type: [
        {
          size: String,
          color: String,
          stock: {
            type: Number,
            default: 0,
            min: 0,
          },
        },
      ],
      default: [],
    },
    imageUrl: {
      type: String,
      required: [true, "Por favor proporcione una imagen"],
    },
    // Opcional: imágenes adicionales para diferentes colores
    additionalImages: {
      type: [
        {
          color: String,
          imageUrl: String,
        },
      ],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Crear índices para mejorar el rendimiento de las consultas
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ price: 1 });

// Verificar si el modelo ya existe para evitar sobreescribirlo
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
