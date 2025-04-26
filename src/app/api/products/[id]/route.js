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

    // Validar datos requeridos
    if (!data.title || !data.price || !data.category) {
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    await connectDB();

    // Buscar y actualizar el producto
    const product = await Product.findByIdAndUpdate(
      id,
      {
        title: data.title,
        description: data.description,
        price: data.price,
        stock: data.stock || 0,
        category: data.category,
        featured: data.featured || false,
        ...(data.imageUrl && { imageUrl: data.imageUrl }),
      },
      { new: true }
    );

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
      { message: "Error al actualizar producto" },
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
