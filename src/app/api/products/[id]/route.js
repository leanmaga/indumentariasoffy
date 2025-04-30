// src/app/api/products/[id]/route.js
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

    // Verificar autenticación y rol de admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    // Validar datos requeridos según el nuevo modelo
    if (
      !data.title ||
      data.salePrice === undefined ||
      data.cost === undefined ||
      data.profitMargin === undefined ||
      !data.category
    ) {
      // Listar los campos que faltan para mejor depuración
      const missingFields = [];
      if (!data.title) missingFields.push("title");
      if (data.salePrice === undefined) missingFields.push("salePrice");
      if (data.cost === undefined) missingFields.push("cost");
      if (data.profitMargin === undefined) missingFields.push("profitMargin");
      if (!data.category) missingFields.push("category");

      console.error("Faltan campos requeridos:", missingFields);

      return NextResponse.json(
        {
          message: "Faltan campos requeridos",
          details: `Campos faltantes: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Preparar los datos de actualización
    const updateData = {
      title: data.title,
      description: data.description,
      // Campos financieros actualizados
      salePrice: parseFloat(data.salePrice),
      promoPrice: parseFloat(data.promoPrice || 0),
      cost: parseFloat(data.cost),
      profitMargin: parseFloat(data.profitMargin),
      stock: data.stock || 0,
      category: data.category,
      featured: data.featured || false,
    };

    // Solo actualizar la imagen si se proporciona una nueva
    if (data.imageUrl) {
      updateData.imageUrl = data.imageUrl;
    }

    // Campos para productos con variantes
    if (Array.isArray(data.sizes)) updateData.sizes = data.sizes;
    if (Array.isArray(data.colors)) updateData.colors = data.colors;
    if (Array.isArray(data.variants)) updateData.variants = data.variants;

    // Campos adicionales específicos por categoría
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.material !== undefined) updateData.material = data.material;
    if (data.style !== undefined) updateData.style = data.style;
    if (data.season !== undefined) updateData.season = data.season;
    if (data.waistType !== undefined) updateData.waistType = data.waistType;
    if (data.fit !== undefined) updateData.fit = data.fit;
    if (data.heelHeight !== undefined)
      updateData.heelHeight = parseFloat(data.heelHeight);
    if (data.soleType !== undefined) updateData.soleType = data.soleType;

    // Buscar y actualizar el producto
    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Producto actualizado con éxito",
      product,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
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
