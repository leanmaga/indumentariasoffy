// app/api/products/route.js - COMPATIBLE CON TU MODELO
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const category = searchParams.get("category");
    const skip = (page - 1) * limit;

    await connectDB();

    // Construir query base
    let query = {};

    // Añadir filtro de categoría si está presente y no es "all"
    if (category && category !== "all") {
      query.category = category;
    }

    // Get total count with filters
    const total = await Product.countDocuments(query);

    // Get products with pagination and filters
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { message: "Error al obtener productos" },
      { status: 500 }
    );
  }
}

// POST method actualizado para tu modelo
export async function POST(request) {
  try {
    // Autenticación: sólo admins pueden crear productos
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const data = await request.json();
    await connectDB();

    // Validaciones de campos obligatorios según tu modelo
    if (!data.title || !data.salePrice || !data.category || !data.imageUrl) {
      const missingFields = [];
      if (!data.title) missingFields.push("Nombre del producto");
      if (!data.salePrice) missingFields.push("Precio de venta");
      if (!data.category) missingFields.push("Categoría");
      if (!data.imageUrl) missingFields.push("Imagen principal");

      return NextResponse.json(
        {
          message: "Faltan campos obligatorios",
          missingFields,
          details: `Por favor completa los siguientes campos: ${missingFields.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Validar que el precio de venta sea mayor a 0
    if (parseFloat(data.salePrice) <= 0) {
      return NextResponse.json(
        { message: "El precio de venta debe ser mayor a 0" },
        { status: 400 }
      );
    }

    // Preparar datos del producto según tu modelo
    const productData = {
      // Campos obligatorios
      title: data.title.trim(),
      salePrice: parseFloat(data.salePrice),
      category: data.category,
      imageUrl: data.imageUrl,

      // Campos con valores por defecto
      description: data.description || "",
      featured: data.featured || false,
      stock: 0, // Se calculará después si hay variantes
      cost: 0, // Valor por defecto según tu modelo
      profitMargin: 0, // Valor por defecto según tu modelo
      promoPrice: 0, // Valor por defecto según tu modelo
    };

    // Agregar campos opcionales solo si tienen valor
    if (data.promoPrice && parseFloat(data.promoPrice) > 0) {
      productData.promoPrice = parseFloat(data.promoPrice);
    }

    if (data.cost && parseFloat(data.cost) > 0) {
      productData.cost = parseFloat(data.cost);
    }

    if (data.profitMargin && parseFloat(data.profitMargin) > 0) {
      productData.profitMargin = parseFloat(data.profitMargin);
    }

    if (data.stock !== undefined && data.stock !== "") {
      productData.stock = parseInt(data.stock) || 0;
    }

    // Campos de indumentaria según tu modelo
    if (data.gender) productData.gender = data.gender;
    if (data.material) productData.material = data.material;
    if (data.style) productData.style = data.style;
    if (data.season) productData.season = data.season;

    // Campos específicos para pantalones según tu modelo
    if (data.category === "pantalones") {
      if (data.waistType) productData.waistType = data.waistType;
      if (data.fit) productData.fit = data.fit;
    }

    // Campos específicos para calzado según tu modelo
    if (data.category === "calzado") {
      if (data.heelHeight !== undefined && data.heelHeight !== "") {
        productData.heelHeight = parseFloat(data.heelHeight) || 0;
      }
      if (data.soleType) productData.soleType = data.soleType;
    }

    // Arrays según tu modelo
    productData.sizes = data.sizes || [];
    productData.colors = data.colors || [];
    productData.variants = data.variants || [];

    // 🔧 PROCESAR IMÁGENES ADICIONALES SEGÚN TU MODELO
    if (data.additionalImages && Array.isArray(data.additionalImages)) {
      productData.additionalImages = data.additionalImages.map((img) => ({
        color: img.color || "",
        imageUrl: img.imageUrl,
      }));
    } else {
      productData.additionalImages = [];
    }

    // Manejar stock
    const variantCategories = ["camisetas", "pantalones", "calzado", "abrigos"];
    if (
      variantCategories.includes(data.category) &&
      data.variants &&
      Array.isArray(data.variants) &&
      data.variants.length > 0
    ) {
      // Calcular stock total desde las variantes
      productData.stock = data.variants.reduce(
        (total, variant) => total + (parseInt(variant.stock) || 0),
        0
      );
    }
    // Crear el nuevo producto
    const newProduct = await Product.create(productData);

    return NextResponse.json(
      {
        message: "Producto creado correctamente",
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error al crear producto:", error);

    // Manejo de errores más específico
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors).map((field) => ({
        field,
        message: error.errors[field].message,
      }));

      return NextResponse.json(
        {
          message: "Error de validación",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error al crear producto: " + error.message },
      { status: 500 }
    );
  }
}
