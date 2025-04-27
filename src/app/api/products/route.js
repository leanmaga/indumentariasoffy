// src/app/api/products/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

// GET para obtener todos los productos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured") === "true";
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;
    const gender = searchParams.get("gender");

    await connectDB();

    // Construir la consulta basada en los parámetros de búsqueda
    let query = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (searchParams.has("featured")) {
      query.featured = featured;
    }

    if (gender) {
      query.gender = gender;
    }

    // Ejecutar la consulta con paginación y ordenación
    const products = await Product.find(query)
      .sort({ [sort]: order })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
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

// POST para crear un nuevo producto
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación y rol de admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();

    // Validar datos requeridos
    if (!data.title || !data.price || !data.category || !data.imageUrl) {
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    await connectDB();

    // Preparar los datos del producto según la categoría
    let productData = {
      title: data.title,
      description: data.description || "",
      price: data.price,
      stock: data.stock || 0,
      category: data.category,
      imageUrl: data.imageUrl,
      featured: data.featured || false,
    };

    // Campos comunes para productos de indumentaria
    const clothingCategories = [
      "camisetas",
      "pantalones",
      "calzado",
      "abrigos",
      "accesorios",
    ];
    if (clothingCategories.includes(data.category)) {
      productData = {
        ...productData,
        gender: data.gender || "",
        material: data.material || "",
        style: data.style || "",
        season: data.season || "",
      };
    }

    // Campos para productos con variantes
    const variantCategories = ["camisetas", "pantalones", "calzado", "abrigos"];
    if (
      variantCategories.includes(data.category) &&
      Array.isArray(data.sizes) &&
      data.sizes.length > 0 &&
      Array.isArray(data.colors) &&
      data.colors.length > 0
    ) {
      productData = {
        ...productData,
        sizes: data.sizes,
        colors: data.colors,
        variants: data.variants || [],
      };

      // Calcular el stock total basado en las variantes
      if (Array.isArray(data.variants) && data.variants.length > 0) {
        productData.stock = data.variants.reduce(
          (total, variant) => total + (variant.stock || 0),
          0
        );
      }
    }

    // Campos específicos para pantalones
    if (data.category === "pantalones") {
      productData = {
        ...productData,
        waistType: data.waistType || "",
        fit: data.fit || "",
      };
    }

    // Campos específicos para calzado
    if (data.category === "calzado") {
      productData = {
        ...productData,
        heelHeight: data.heelHeight || 0,
        soleType: data.soleType || "",
      };
    }

    // Crear el producto
    const product = new Product(productData);

    await product.save();

    return NextResponse.json(
      { message: "Producto creado con éxito", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { message: "Error al crear producto: " + error.message },
      { status: 500 }
    );
  }
}
