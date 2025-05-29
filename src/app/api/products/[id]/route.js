// app/api/products/[id]/route.js - COMPATIBLE CON TU MODELO
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

// PUT para actualizar un producto - COMPATIBLE CON TU MODELO
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación y permisos
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const { id } = await params; // IMPORTANTE: await params
    const data = await request.json();

    console.log("📝 Updating product:", id); // Para debugging
    console.log("📥 Update data:", data); // Para debugging

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

    // Preparar datos del producto para actualizar según tu modelo
    const productData = {
      title: data.title.trim(),
      description: data.description || "",
      salePrice: parseFloat(data.salePrice),
      category: data.category,
      featured: data.featured || false,
    };

    // Manejo de imagen principal
    if (data.imageUrl) {
      productData.imageUrl = data.imageUrl;
    }
    // Si no se envía nueva imagen, mantener la existente

    // 🔧 PROCESAR IMÁGENES ADICIONALES SEGÚN TU MODELO
    if (data.additionalImages !== undefined) {
      if (Array.isArray(data.additionalImages)) {
        productData.additionalImages = data.additionalImages.map((img) => ({
          color: img.color || "",
          imageUrl: img.imageUrl,
        }));
      } else {
        productData.additionalImages = [];
      }
    }
    // Si no se envían additionalImages, mantener las existentes

    // Campos financieros opcionales
    if (data.promoPrice !== undefined) {
      if (data.promoPrice === "" || data.promoPrice === null) {
        productData.promoPrice = 0; // Limpiar si se envía vacío
      } else {
        productData.promoPrice = parseFloat(data.promoPrice) || 0;
      }
    }

    if (data.cost !== undefined) {
      if (data.cost === "" || data.cost === null) {
        productData.cost = 0; // Limpiar si se envía vacío
      } else {
        productData.cost = parseFloat(data.cost) || 0;
      }
    }

    if (data.profitMargin !== undefined) {
      if (data.profitMargin === "" || data.profitMargin === null) {
        productData.profitMargin = 0; // Limpiar si se envía vacío
      } else {
        productData.profitMargin = parseFloat(data.profitMargin) || 0;
      }
    }

    // Stock
    if (data.stock !== undefined) {
      if (data.stock === "" || data.stock === null) {
        productData.stock = 0;
      } else {
        productData.stock = parseInt(data.stock) || 0;
      }
    }

    // Campos de indumentaria según tu modelo
    const clothingCategories = [
      "ropa",
      "camisetas",
      "pantalones",
      "calzado",
      "abrigos",
      "accesorios",
    ];

    if (clothingCategories.includes(data.category)) {
      if (data.gender !== undefined) productData.gender = data.gender || "";
      if (data.material !== undefined)
        productData.material = data.material || "";
      if (data.style !== undefined) productData.style = data.style || "";
      if (data.season !== undefined) productData.season = data.season || "";
    }

    // Campos para productos con variantes
    const variantCategories = ["camisetas", "pantalones", "calzado", "abrigos"];
    if (
      variantCategories.includes(data.category) &&
      data.sizes &&
      Array.isArray(data.sizes) &&
      data.sizes.length > 0 &&
      data.colors &&
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

    // Campos específicos para pantalones según tu modelo
    if (data.category === "pantalones") {
      if (data.waistType !== undefined)
        productData.waistType = data.waistType || "";
      if (data.fit !== undefined) productData.fit = data.fit || "";
    }

    // Campos específicos para calzado según tu modelo
    if (data.category === "calzado") {
      if (data.heelHeight !== undefined) {
        productData.heelHeight =
          data.heelHeight === "" ? 0 : parseFloat(data.heelHeight) || 0;
      }
      if (data.soleType !== undefined)
        productData.soleType = data.soleType || "";
    }

    console.log("📦 Final update data for your model:", productData); // Para debugging

    // Actualizar el producto con findByIdAndUpdate
    const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
      new: true, // Devuelve el documento actualizado
      runValidators: true, // Ejecuta las validaciones del modelo
    });

    console.log("✅ Product updated successfully:", updatedProduct._id); // Para debugging

    return NextResponse.json({
      message: "Producto actualizado correctamente",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);

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

    if (error.name === "CastError") {
      return NextResponse.json(
        { message: "ID de producto inválido" },
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

    console.log("🗑️ Deleting product:", id); // Para debugging

    await connectDB();

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    console.log("✅ Product deleted successfully:", id); // Para debugging

    return NextResponse.json({
      message: "Producto eliminado con éxito",
      deletedId: id,
    });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);

    if (error.name === "CastError") {
      return NextResponse.json(
        { message: "ID de producto inválido" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error al eliminar producto: " + error.message },
      { status: 500 }
    );
  }
}
