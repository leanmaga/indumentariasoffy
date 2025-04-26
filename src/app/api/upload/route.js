import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No se ha proporcionado ningún archivo" },
        { status: 400 }
      );
    }

    // Convertir el archivo a un formato base64 para cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString(
      "base64"
    )}`;

    // Subir la imagen a Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: "ecommerce_products",
    });

    return NextResponse.json({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Error al subir imagen a Cloudinary:", error);
    return NextResponse.json(
      { error: `Error al subir la imagen: ${error.message}` },
      { status: 500 }
    );
  }
}
