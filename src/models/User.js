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
      required: function () {
        return !this.googleAuth;
      },
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false,
    },
    phone: {
      type: String,
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
    googleAuth: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "",
    },
    // Campos para verificación de email
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    // Campos para reseteo de contraseña
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// VERSIÓN MEJORADA: Hash password before saving
userSchema.pre("save", async function (next) {
  try {
    // Skip hashing for Google accounts without password
    if (this.googleAuth && !this.password) {
      return next();
    }

    // Only hash if password is modified
    if (!this.isModified("password")) {
      return next();
    }

    // Verificar que no sea un hash ya existente
    if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error);
  }
});

// VERSIÓN SIMPLIFICADA: Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Usar bcrypt.compare directamente
    return bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("Error al comparar contraseñas:", error);
    return false;
  }
};

// Method to check if user can use Google Auth
userSchema.methods.canUseGoogleAuth = function () {
  return this.googleAuth || true;
};

// Prevent model overwrite in development
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
