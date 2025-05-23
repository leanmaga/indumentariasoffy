// src/app/api/products/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

// GET para obtener un producto específico por ID
export async function GET(request, { params }) {
  try {
    const { id } = await params; // IMPORTANTE: await params

    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { message: "Error al obtener producto" },
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

    const { id } = await params; // IMPORTANTE: await params
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

    // Validaciones de campos obligatorios únicamente
    if (!data.title || !data.salePrice || !data.category) {
      const missingFields = [];
      if (!data.title) missingFields.push("Nombre del producto");
      if (!data.salePrice) missingFields.push("Precio de venta");
      if (!data.category) missingFields.push("Categoría");

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

    // Preparar datos del producto para actualizar (solo campos obligatorios)
    const productData = {
      title: data.title.trim(),
      description: data.description || "",
      salePrice: parseFloat(data.salePrice),
      category: data.category,
      featured: data.featured || false,
      // IMPORTANTE: Incluir additionalImages siempre
      additionalImages:
        data.additionalImages || existingProduct.additionalImages || [],
    };

    // Añadir imageUrl solo si se proporciona
    if (data.imageUrl) {
      productData.imageUrl = data.imageUrl;
    }

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

    // Stock
    if (data.stock !== undefined && data.stock !== "") {
      productData.stock = parseInt(data.stock) || 0;
    }

    // Campos comunes para productos de indumentaria
    const clothingCategories = [
      "ropa",
      "camisetas",
      "pantalones",
      "calzado",
      "abrigos",
      "accesorios",
    ];

    if (clothingCategories.includes(data.category)) {
      if (data.gender) productData.gender = data.gender;
      if (data.material) productData.material = data.material;
      if (data.style) productData.style = data.style;
      if (data.season) productData.season = data.season;
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
          (total, variant) => total + (parseInt(variant.stock) || 0),
          0
        );
      }
    } else {
      // Limpiar campos de variantes si la categoría no los necesita
      productData.sizes = [];
      productData.colors = [];
      productData.variants = [];
    }

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

    // Actualizar el producto con findByIdAndUpdate
    const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
      new: true, // Devuelve el documento actualizado
      runValidators: true, // Ejecuta las validaciones del modelo
    });

    return NextResponse.json({
      message: "Producto actualizado correctamente",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);

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
      { message: "Error al actualizar producto: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE para eliminar un producto
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params; // IMPORTANTE: await params
    await connectDB();

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
