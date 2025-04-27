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
      enum: [
        "ropa",
        "camisetas",
        "pantalones",
        "abrigos",
        "calzado",
        "accesorios",
        "electronica",
        "hogar",
        "deporte",
        "otros",
      ],
      default: "otros",
    },
    // Atributos comunes para productos de indumentaria
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
    // Campos específicos para categorías de indumentaria
    gender: {
      type: String,
      enum: ["hombre", "mujer", "unisex", "niños", "niñas", "bebés", ""],
      default: "",
    },
    material: {
      type: String,
      default: "",
    },
    style: {
      type: String,
      default: "",
    },
    season: {
      type: String,
      enum: ["verano", "invierno", "primavera", "otoño", "todas", ""],
      default: "",
    },
    // Campos específicos para pantalones
    waistType: {
      type: String,
      enum: ["regular", "alto", "bajo", ""],
      default: "",
    },
    fit: {
      type: String,
      enum: ["skinny", "slim", "regular", "relaxed", "bootcut", "wide", ""],
      default: "",
    },
    // Campos específicos para calzado
    heelHeight: {
      type: Number,
      default: 0,
    },
    soleType: {
      type: String,
      default: "",
    },
    // Campos para fotos y presentación
    imageUrl: {
      type: String,
      required: [true, "Por favor proporcione una imagen"],
    },
    // Imágenes adicionales para diferentes colores
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
    // Campos para valoraciones
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
productSchema.index({ gender: 1 });
productSchema.index({ "variants.size": 1, "variants.color": 1 });

// Verificar si el modelo ya existe para evitar sobreescribirlo
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
