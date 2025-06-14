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
    // Solo encriptar si no está ya encriptado (no empieza con APP_USR)
    if (!this.accessToken.startsWith("APP_USR")) {
      this.accessToken = encrypt(this.accessToken);
    }
  }
  if (this.isModified("refreshToken") && this.refreshToken) {
    // Solo encriptar si no está ya encriptado
    if (!this.refreshToken.startsWith("TG-")) {
      this.refreshToken = encrypt(this.refreshToken);
    }
  }
  next();
});

// Método ROBUSTO para obtener el access token desencriptado
mercadoPagoConfigSchema.methods.getDecryptedAccessToken = function () {
  console.log("🔐 Iniciando desencriptación del access token...");

  try {
    if (!this.accessToken) {
      console.log("❌ No hay accessToken para desencriptar");
      return null;
    }

    // Si el token ya está en texto plano (comienza con APP_USR)
    if (this.accessToken.startsWith("APP_USR")) {
      console.log("✅ Token ya está en texto plano");
      return this.accessToken;
    }

    // Si parece estar encriptado (tiene formato iv:authTag:encrypted)
    if (
      this.accessToken.includes(":") &&
      this.accessToken.split(":").length === 3
    ) {
      console.log("🔐 Token parece estar encriptado, intentando descifrar...");

      try {
        const decrypted = decrypt(this.accessToken);
        console.log("✅ Token desencriptado exitosamente");
        return decrypted;
      } catch (decryptError) {
        console.error("❌ Error al desencriptar:", decryptError.message);

        // Si falla el descifrado, podría ser un problema de clave
        console.log("🔄 Intentando usar token sin descifrar...");
        return this.accessToken;
      }
    }

    // Si no tiene formato de encriptación ni empieza con APP_USR
    console.log("🤔 Formato de token desconocido, usando tal como está");
    return this.accessToken;
  } catch (error) {
    console.error("❌ Error general al procesar access token:", error);
    return null;
  }
};

// Método ROBUSTO para obtener el refresh token desencriptado
mercadoPagoConfigSchema.methods.getDecryptedRefreshToken = function () {
  console.log("🔐 Iniciando desencriptación del refresh token...");

  try {
    if (!this.refreshToken) {
      console.log("ℹ️ No hay refreshToken");
      return null;
    }

    // Si el token ya está en texto plano (comienza con TG-)
    if (this.refreshToken.startsWith("TG-")) {
      console.log("✅ Refresh token ya está en texto plano");
      return this.refreshToken;
    }

    // Si parece estar encriptado
    if (
      this.refreshToken.includes(":") &&
      this.refreshToken.split(":").length === 3
    ) {
      console.log(
        "🔐 Refresh token parece estar encriptado, intentando descifrar..."
      );

      try {
        const decrypted = decrypt(this.refreshToken);
        console.log("✅ Refresh token desencriptado exitosamente");
        return decrypted;
      } catch (decryptError) {
        console.error(
          "❌ Error al desencriptar refresh token:",
          decryptError.message
        );
        return this.refreshToken;
      }
    }

    console.log(
      "🤔 Formato de refresh token desconocido, usando tal como está"
    );
    return this.refreshToken;
  } catch (error) {
    console.error("❌ Error general al procesar refresh token:", error);
    return null;
  }
};

// Método estático MEJORADO para obtener la configuración activa
mercadoPagoConfigSchema.statics.getActiveConfig = async function () {
  console.log("🔍 Buscando configuración activa en la base de datos...");

  try {
    const config = await this.findOne({ isActive: true }).sort({
      createdAt: -1,
    });

    console.log("📊 Resultado de búsqueda:", {
      found: !!config,
      userId: config?.userId,
      hasAccessToken: !!config?.accessToken,
      accessTokenStart: config?.accessToken?.substring(0, 15) + "...",
      isActive: config?.isActive,
      expiresAt: config?.expiresAt,
      isExpired: config?.expiresAt ? new Date() > config.expiresAt : false,
    });

    return config;
  } catch (error) {
    console.error("❌ Error al buscar configuración activa:", error);
    throw error;
  }
};

const MercadoPagoConfig =
  mongoose.models.MercadoPagoConfig ||
  mongoose.model("MercadoPagoConfig", mercadoPagoConfigSchema);

export default MercadoPagoConfig;
