// src/app/api/admin/hero-image/route.js
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import SiteConfig from "@/models/SiteConfig";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    const { image, deleteOld = true } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No se proporcionó imagen" },
        { status: 400 }
      );
    }

    // Si existe una imagen anterior y se quiere eliminar
    if (deleteOld) {
      const oldConfig = await SiteConfig.findOne({
        key: "hero_image_public_id",
      });
      if (oldConfig && oldConfig.value) {
        try {
          await deleteImage(oldConfig.value);
        } catch (deleteError) {
          console.warn("Error al eliminar imagen anterior:", deleteError);
          // No fallar si no se puede eliminar la imagen anterior
        }
      }
    }

    // Subir nueva imagen
    const { imageUrl, publicId } = await uploadImage(image);

    // Actualizar o crear configuración de la URL de la imagen
    await SiteConfig.findOneAndUpdate(
      { key: "hero_image_url" },
      {
        value: imageUrl,
        description: "URL de la imagen principal del hero",
        updatedAt: new Date(),
      },
      { upsert: true }
    );

    // Guardar el public_id para poder eliminar después
    await SiteConfig.findOneAndUpdate(
      { key: "hero_image_public_id" },
      {
        value: publicId,
        description: "Public ID de Cloudinary para la imagen hero",
        updatedAt: new Date(),
      },
      { upsert: true }
    );

    const response = NextResponse.json({
      success: true,
      imageUrl,
      message: "Imagen del hero actualizada correctamente",
      timestamp: Date.now(),
    });

    // Headers para evitar caché de esta respuesta
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error al actualizar imagen del hero:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const config = await SiteConfig.findOne({ key: "hero_image_url" });
    const imageUrl = config?.value || "/default-hero.webp";

    const response = NextResponse.json({
      imageUrl,
      timestamp: Date.now(),
      cached: !!config,
    });

    // Headers de caché más agresivos para GET
    // Cachear por 5 minutos, pero permitir revalidación
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=60"
    );

    // ETag para validación condicional
    if (config?.updatedAt) {
      const etag = `"${config.updatedAt.getTime()}"`;
      response.headers.set("ETag", etag);

      // Verificar If-None-Match
      const ifNoneMatch = request.headers.get("If-None-Match");
      if (ifNoneMatch === etag) {
        return new Response(null, { status: 304 });
      }
    }

    return response;
  } catch (error) {
    console.error("Error al obtener imagen del hero:", error);

    // En caso de error, devolver imagen por defecto pero sin caché
    const errorResponse = NextResponse.json(
      {
        imageUrl: "/default-hero.webp",
        error: "Error al cargar imagen personalizada",
        timestamp: Date.now(),
      },
      { status: 200 } // 200 porque tenemos fallback
    );

    errorResponse.headers.set("Cache-Control", "no-cache");
    return errorResponse;
  }
}
