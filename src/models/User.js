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
      required: [true, "Por favor proporcione una contraseña"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Por favor proporcione un número de teléfono"],
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
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);

    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Verificar que tanto la contraseña candidata como la contraseña almacenada existen
    if (!candidatePassword || !this.password) {
      return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};

// Prevent model overwrite error in development due to hot reloading
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
