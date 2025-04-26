import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

// GET - Obtener un producto por ID
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
      { message: "Error al obtener el producto" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un producto (solo admin)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación y permisos
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = params;
    const formData = await request.formData();

    await connectDB();

    // Buscar el producto existente
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar datos básicos
    product.title = formData.get("title") || product.title;
    product.description = formData.get("description") || product.description;
    product.price = parseFloat(formData.get("price")) || product.price;
    product.category = formData.get("category") || product.category;
    product.featured = formData.get("featured") === "true";

    // Actualizar imagen si se proporciona una nueva
    const image = formData.get("image");

    if (image && image.size > 0) {
      // Eliminar imagen anterior de Cloudinary
      await deleteImage(product.publicId);

      // Subir nueva imagen
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const imageBase64 = `data:${image.type};base64,${buffer.toString(
        "base64"
      )}`;

      const { imageUrl, publicId } = await uploadImage(imageBase64);

      product.imageUrl = imageUrl;
      product.publicId = publicId;
    }

    await product.save();

    return NextResponse.json({
      message: "Producto actualizado correctamente",
      product,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { message: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un producto (solo admin)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación y permisos
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = params;

    await connectDB();

    // Buscar el producto
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar imagen de Cloudinary
    await deleteImage(product.publicId);

    // Eliminar producto de la base de datos
    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { message: "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}
