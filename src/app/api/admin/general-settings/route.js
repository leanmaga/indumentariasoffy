import SiteConfig from "@/models/SiteConfig";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    console.log("🔄 POST /api/admin/general-settings - Iniciando...");

    // Conectar a la base de datos
    await connectDB();
    console.log("✅ Conexión a DB establecida");

    const body = await request.json();
    console.log("📝 Datos recibidos:", {
      ...body,
      contactEmail: body.contactEmail ? "***@***.***" : "undefined",
    });

    const { storeName, contactEmail, storeDescription } = body;

    if (!storeName || !contactEmail || !storeDescription) {
      return NextResponse.json(
        {
          error: "Todos los campos son obligatorios",
          received: {
            storeName: !!storeName,
            contactEmail: !!contactEmail,
            storeDescription: !!storeDescription,
          },
        },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        {
          error: "El email no tiene un formato válido",
        },
        { status: 400 }
      );
    }

    console.log("💾 Guardando configuraciones...");

    // Actualizar o crear cada configuración
    const updatePromises = [
      SiteConfig.findOneAndUpdate(
        { key: "store_name" },
        {
          value: storeName,
          description: "Nombre de la tienda",
        },
        { upsert: true, new: true }
      ),
      SiteConfig.findOneAndUpdate(
        { key: "contact_email" },
        {
          value: contactEmail,
          description: "Email de contacto de la tienda",
        },
        { upsert: true, new: true }
      ),
      SiteConfig.findOneAndUpdate(
        { key: "store_description" },
        {
          value: storeDescription,
          description: "Descripción de la tienda",
        },
        { upsert: true, new: true }
      ),
    ];

    const results = await Promise.all(updatePromises);
    console.log("✅ Configuraciones guardadas exitosamente");

    return NextResponse.json({
      success: true,
      message: "Configuración general guardada correctamente",
      updated: results.length,
    });
  } catch (error) {
    console.error("❌ Error al guardar configuración general:", error);

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("🔄 GET /api/admin/general-settings - Iniciando...");

    // Conectar a la base de datos
    await connectDB();
    console.log("✅ Conexión a DB establecida");

    const configs = await SiteConfig.find({
      key: { $in: ["store_name", "contact_email", "store_description"] },
    });

    console.log("📊 Configuraciones encontradas:", configs.length);

    // Convertir a objeto para facilitar el acceso
    const settings = {};
    configs.forEach((config) => {
      settings[config.key] = config.value;
    });

    const response = {
      storeName: settings.store_name || "Indumentaria Soffy",
      contactEmail:
        settings.contact_email || "patagoniascript@indumentariasoffy.com",
      storeDescription:
        settings.store_description ||
        "Encuentra los mejores productos al mejor precio.",
    };

    console.log("✅ Configuración devuelta exitosamente");

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error al obtener configuración general:", error);

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
