// app/api/products/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

// GET para obtener un producto específico por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

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
