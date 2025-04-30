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

    // Asegurar que los campos financieros estén disponibles para productos antiguos
    const processedProduct = {
      ...product.toObject(),
      // Usar el campo antiguo price como salePrice si no existe
      salePrice:
        product.salePrice !== undefined ? product.salePrice : product.price,
      // Valores por defecto para campos posiblemente ausentes
      promoPrice: product.promoPrice || 0,
      cost: product.cost !== undefined ? product.cost : 0,
      profitMargin:
        product.profitMargin !== undefined ? product.profitMargin : 0,
    };

    return NextResponse.json(processedProduct);
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

    // Obtener los datos - puede ser formData o JSON
    let updateData;
    const contentType = request.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      // Si es formData (para archivos)
      const formData = await request.formData();

      // Convertir formData a objeto
      updateData = {};
      for (const [key, value] of formData.entries()) {
        if (key !== "image") {
          updateData[key] = value;
        }
      }
    } else {
      // Si es JSON
      updateData = await request.json();
    }

    await connectDB();

    // Buscar el producto existente
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar campos básicos
    product.title = updateData.title || product.title;
    product.description = updateData.description || product.description;
    product.category = updateData.category || product.category;
    product.featured =
      updateData.featured === true || updateData.featured === "true"
        ? true
        : !!product.featured;

    // Actualizar campos financieros
    if (updateData.salePrice !== undefined) {
      product.salePrice = parseFloat(updateData.salePrice);
    } else if (updateData.price !== undefined) {
      // Compatibilidad con campo antiguo
      product.salePrice = parseFloat(updateData.price);
    }

    if (updateData.promoPrice !== undefined) {
      product.promoPrice = parseFloat(updateData.promoPrice);
    }

    if (updateData.cost !== undefined) {
      product.cost = parseFloat(updateData.cost);
    }

    if (updateData.profitMargin !== undefined) {
      product.profitMargin = parseFloat(updateData.profitMargin);
    }

    // Actualizar stock
    if (updateData.stock !== undefined) {
      product.stock = parseInt(updateData.stock);
    }

    // Actualizar campos para indumentaria
    if (updateData.gender !== undefined) product.gender = updateData.gender;
    if (updateData.material !== undefined)
      product.material = updateData.material;
    if (updateData.style !== undefined) product.style = updateData.style;
    if (updateData.season !== undefined) product.season = updateData.season;

    // Campos específicos para pantalones
    if (updateData.waistType !== undefined)
      product.waistType = updateData.waistType;
    if (updateData.fit !== undefined) product.fit = updateData.fit;

    // Campos específicos para calzado
    if (updateData.heelHeight !== undefined)
      product.heelHeight = parseFloat(updateData.heelHeight);
    if (updateData.soleType !== undefined)
      product.soleType = updateData.soleType;

    // Actualizar variantes, tallas y colores si se proporcionan
    if (Array.isArray(updateData.sizes)) product.sizes = updateData.sizes;
    if (Array.isArray(updateData.colors)) product.colors = updateData.colors;
    if (Array.isArray(updateData.variants))
      product.variants = updateData.variants;

    // Manejar imagen si se proporciona una nueva
    const image =
      contentType && contentType.includes("multipart/form-data")
        ? await request.formData().then((formData) => formData.get("image"))
        : null;

    if (image && image.size > 0) {
      // Eliminar imagen anterior de Cloudinary si existe
      if (product.publicId) {
        await deleteImage(product.publicId);
      }

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
      { message: `Error al actualizar el producto: ${error.message}` },
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

    // Eliminar imagen de Cloudinary si tiene publicId
    if (product.publicId) {
      await deleteImage(product.publicId);
    }

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
