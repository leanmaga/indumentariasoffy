import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "La cantidad debe ser al menos 1"],
        },
        price: {
          type: Number,
          required: true,
        },
        imageUrl: {
          type: String,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pendiente",
        "pagado",
        "enviado",
        "entregado",
        "cancelado",
        "whatsapp_pendiente",
      ],
      default: "pendiente",
    },
    paymentId: {
      type: String,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["mercadopago", "credit_card", "debit_card", "whatsapp"],
    },
    whatsappOrder: {
      type: Boolean,
      default: false,
    },
    shippingInfo: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
    },
    // Campo agregado para detalles del pago y/o errores
    paymentDetails: {
      type: Object,
      default: {},
    },
    // Si usas idempotencyKey, asegúrate de incluirlo en el modelo
    idempotencyKey: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevenir que el modelo se sobrescriba durante el desarrollo debido al hot reloading
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
