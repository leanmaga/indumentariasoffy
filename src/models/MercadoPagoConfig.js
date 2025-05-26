// src/models/MercadoPagoConfig.js
import mongoose from "mongoose";
import crypto from "crypto";

// Funciones de encriptación/desencriptación
const algorithm = "aes-256-gcm";
const secretKey =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
}

function decrypt(text) {
  const parts = text.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    iv
  );
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

const mercadoPagoConfigSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    publicKey: {
      type: String,
    },
    userIdMP: {
      type: String, // ID del usuario en MercadoPago
    },
    isProduction: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Encriptar tokens antes de guardar
mercadoPagoConfigSchema.pre("save", function (next) {
  if (this.isModified("accessToken") && this.accessToken) {
    this.accessToken = encrypt(this.accessToken);
  }
  if (this.isModified("refreshToken") && this.refreshToken) {
    this.refreshToken = encrypt(this.refreshToken);
  }
  next();
});

// Método para obtener el access token desencriptado
mercadoPagoConfigSchema.methods.getDecryptedAccessToken = function () {
  try {
    return decrypt(this.accessToken);
  } catch (error) {
    console.error("Error al desencriptar access token:", error);
    return null;
  }
};

// Método para obtener el refresh token desencriptado
mercadoPagoConfigSchema.methods.getDecryptedRefreshToken = function () {
  try {
    return this.refreshToken ? decrypt(this.refreshToken) : null;
  } catch (error) {
    console.error("Error al desencriptar refresh token:", error);
    return null;
  }
};

// Método estático para obtener la configuración activa
mercadoPagoConfigSchema.statics.getActiveConfig = async function () {
  const config = await this.findOne({ isActive: true });
  return config;
};

const MercadoPagoConfig =
  mongoose.models.MercadoPagoConfig ||
  mongoose.model("MercadoPagoConfig", mercadoPagoConfigSchema);

export default MercadoPagoConfig;
