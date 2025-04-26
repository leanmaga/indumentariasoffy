// lib/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función para subir imágenes
export const uploadImage = async (file) => {
  try {
    // Asegúrate de que file sea un string base64 o un buffer
    const result = await cloudinary.uploader.upload(file, {
      folder: "ecommerce_products",
    });

    return {
      imageUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Error al subir imagen a Cloudinary:", error);
    throw new Error(`Error al subir la imagen: ${error.message}`);
  }
};

// Función para eliminar imágenes
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: result.result === "ok" };
  } catch (error) {
    console.error("Error al eliminar imagen de Cloudinary:", error);
    throw new Error(`Error al eliminar la imagen: ${error.message}`);
  }
};

export default cloudinary;
