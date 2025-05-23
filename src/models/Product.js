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
    // Precio de venta (precio principal en tienda) - OBLIGATORIO
    salePrice: {
      type: Number,
      required: [true, "Por favor proporcione el precio de venta"],
      min: [0, "El precio no puede ser negativo"],
    },
    // Precio promocional opcional
    promoPrice: {
      type: Number,
      default: 0,
      min: [0, "El precio promocional no puede ser negativo"],
    },
    // Costo interno (no se muestra en tienda) - AHORA OPCIONAL
    cost: {
      type: Number,
      // required: [true, "Por favor proporcione el costo del producto"], // REMOVIDO
      min: [0, "El costo no puede ser negativo"],
      default: 0, // Valor por defecto
    },
    // Margen de ganancia (%) calculado o manual - AHORA OPCIONAL
    profitMargin: {
      type: Number,
      // required: [true, "Por favor proporcione el margen de ganancia"], // REMOVIDO
      min: [0, "El margen no puede ser negativo"],
      max: [100, "El margen no puede exceder el 100%"],
      default: 0, // Valor por defecto
    },
    stock: {
      type: Number,
      // required: [true, "Por favor proporcione el stock"], // REMOVIDO para hacerlo opcional
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
      // default: "otros", // Removido para forzar selección
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
productSchema.index({ salePrice: 1 }); // Cambiado de price a salePrice
productSchema.index({ gender: 1 });
productSchema.index({ "variants.size": 1, "variants.color": 1 });

// Middleware pre-save para calcular stock total si hay variantes
productSchema.pre("save", function (next) {
  // Si hay variantes, calcular el stock total
  if (this.variants && this.variants.length > 0) {
    this.stock = this.variants.reduce((total, variant) => {
      return total + (variant.stock || 0);
    }, 0);
  }

  // Si se proporciona costo y precio de venta pero no margen, calcularlo
  if (this.cost > 0 && this.salePrice > 0 && !this.profitMargin) {
    this.profitMargin = ((this.salePrice - this.cost) / this.salePrice) * 100;
  }

  next();
});

// Virtual para verificar si tiene descuento
productSchema.virtual("hasDiscount").get(function () {
  return this.promoPrice > 0 && this.promoPrice < this.salePrice;
});

// Virtual para calcular porcentaje de descuento
productSchema.virtual("discountPercentage").get(function () {
  if (this.hasDiscount) {
    return Math.round(
      ((this.salePrice - this.promoPrice) / this.salePrice) * 100
    );
  }
  return 0;
});

// Verificar si el modelo ya existe para evitar sobreescribirlo
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
