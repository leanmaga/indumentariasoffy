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
        await deleteImage(oldConfig.value);
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
      },
      { upsert: true }
    );

    // Guardar el public_id para poder eliminar después
    await SiteConfig.findOneAndUpdate(
      { key: "hero_image_public_id" },
      {
        value: publicId,
        description: "Public ID de Cloudinary para la imagen hero",
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      imageUrl,
      message: "Imagen del hero actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar imagen del hero:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const config = await SiteConfig.findOne({ key: "hero_image_url" });

    return NextResponse.json({
      imageUrl: config?.value || "/default-hero.jpg",
    });
  } catch (error) {
    console.error("Error al obtener imagen del hero:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
