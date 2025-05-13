// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Por favor proporcione un nombre"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Por favor proporcione un correo electrónico"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor proporcione un correo electrónico válido",
      ],
    },
    password: {
      type: String,
      // Hacemos el password condicional - solo requerido si no es Google Auth
      required: function () {
        return !this.googleAuth;
      },
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false,
    },
    phone: {
      type: String,
      // Hacemos el teléfono condicional - solo requerido si no es Google Auth
      required: function () {
        return !this.googleAuth;
      },
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    // Nuevos campos para soporte de Google Auth
    googleAuth: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
  // Si es una cuenta de Google sin contraseña, no intentar hashear
  if (this.googleAuth && !this.password) {
    return next();
  }

  // Solo hashear la contraseña si ha sido modificada (o es nueva)
  if (!this.isModified("password")) return next();

  try {
    // Generar un salt
    const salt = await bcrypt.genSalt(10);

    // Hashear la contraseña junto con el nuevo salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Si es una cuenta de Google sin contraseña tradicional
    if (this.googleAuth && !this.password) {
      return false; // No permitir inicio de sesión con contraseña
    }

    // Verificar que tanto la contraseña candidata como la almacenada existen
    if (!candidatePassword || !this.password) {
      return false;
    }

    // Comparar contraseñas
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};

// Método auxiliar para verificar si un usuario puede usar Google Auth
userSchema.methods.canUseGoogleAuth = function () {
  // Un usuario puede usar Google Auth si:
  // 1. Ya tiene googleAuth activo, o
  // 2. Tiene una cuenta pero queremos permitir vincularla
  return this.googleAuth || true;
};

// Prevenir error de sobrescritura de modelo en desarrollo debido a hot reloading
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
