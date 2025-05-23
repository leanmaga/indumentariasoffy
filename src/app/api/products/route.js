// app/api/products/[id]/route.js
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

// PUT para actualizar un producto
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación y permisos
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const { id } = params;
    const data = await request.json();

    await connectDB();

    // Verificar si el producto existe
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Preparar datos del producto para actualizar
    const productData = {
      title: data.title,
      description: data.description || "",
      // Campos financieros
      salePrice: parseFloat(data.salePrice),
      promoPrice: parseFloat(data.promoPrice || 0),
      cost: parseFloat(data.cost),
      profitMargin: parseFloat(data.profitMargin),
      stock: parseInt(data.stock) || 0,
      category: data.category,
      featured: data.featured || false,
      // IMPORTANTE: Incluir additionalImages
      additionalImages: data.additionalImages || [],
    };

    // Añadir imageUrl solo si se proporciona
    if (data.imageUrl) {
      productData.imageUrl = data.imageUrl;
    }

    // Campos comunes para productos de indumentaria
    const clothingCategories = [
      "camisetas",
      "pantalones",
      "calzado",
      "abrigos",
      "accesorios",
    ];
    if (clothingCategories.includes(data.category)) {
      productData.gender = data.gender || "";
      productData.material = data.material || "";
      productData.style = data.style || "";
      productData.season = data.season || "";
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
      productData.sizes = data.sizes;
      productData.colors = data.colors;
      productData.variants = data.variants || [];

      // Calcular stock total basado en las variantes
      if (Array.isArray(data.variants) && data.variants.length > 0) {
        productData.stock = data.variants.reduce(
          (total, variant) => total + (variant.stock || 0),
          0
        );
      }
    }

    // Campos específicos para pantalones
    if (data.category === "pantalones") {
      productData.waistType = data.waistType || "";
      productData.fit = data.fit || "";
    }

    // Campos específicos para calzado
    if (data.category === "calzado") {
      productData.heelHeight = data.heelHeight || 0;
      productData.soleType = data.soleType || "";
    }

    // Actualizar el producto con findByIdAndUpdate
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      productData,
      { new: true } // Devuelve el documento actualizado
    );

    return NextResponse.json({
      message: "Producto actualizado correctamente",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { message: "Error al actualizar producto: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE para eliminar un producto (si lo necesitas)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación y rol de admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = params;

    await connectDB();

    // Buscar y eliminar el producto
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Producto eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { message: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}

// app/api/products/route.js (POST method actualizado)
export async function POST(request) {
  try {
    // Autenticación: sólo admins pueden crear productos
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const data = await request.json();
    await connectDB();

    // Validaciones de campos obligatorios únicamente
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

    // Preparar datos del producto con valores por defecto para campos opcionales
    const productData = {
      // Campos obligatorios
      title: data.title,
      salePrice: parseFloat(data.salePrice),
      category: data.category,
      imageUrl: data.imageUrl,

      // Campos con valores por defecto
      description: data.description || "",
      featured: data.featured || false,
      additionalImages: data.additionalImages || [],
      sizes: data.sizes || [],
      colors: data.colors || [],
      variants: data.variants || [],
      stock: 0, // Se calculará después si hay variantes
    };

    // Agregar campos financieros opcionales solo si tienen valor
    if (data.promoPrice !== undefined && data.promoPrice !== "") {
      productData.promoPrice = parseFloat(data.promoPrice) || 0;
    }

    if (data.cost !== undefined && data.cost !== "") {
      productData.cost = parseFloat(data.cost);
    }

    if (data.profitMargin !== undefined && data.profitMargin !== "") {
      productData.profitMargin = parseFloat(data.profitMargin);
    }

    // Agregar campos de indumentaria opcionales solo si tienen valor
    if (data.gender) productData.gender = data.gender;
    if (data.material) productData.material = data.material;
    if (data.style) productData.style = data.style;
    if (data.season) productData.season = data.season;

    // Campos específicos para pantalones
    if (data.category === "pantalones") {
      if (data.waistType) productData.waistType = data.waistType;
      if (data.fit) productData.fit = data.fit;
    }

    // Campos específicos para calzado
    if (data.category === "calzado") {
      if (data.heelHeight !== undefined && data.heelHeight !== "") {
        productData.heelHeight = parseFloat(data.heelHeight) || 0;
      }
      if (data.soleType) productData.soleType = data.soleType;
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
    } else if (data.stock !== undefined && data.stock !== "") {
      // Usar el stock proporcionado o 0 por defecto
      productData.stock = parseInt(data.stock) || 0;
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
    console.error("Error al crear producto:", error);

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
