// src/app/admin/products/edit/[id]/page.js
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data";
import ProductForm from "@/components/admin/ProductForm";

export async function generateMetadata({ params }) {
  // Esperar a que params esté resuelto
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    return {
      title: "Producto no encontrado | TiendaOnline",
    };
  }

  return {
    title: `Editar ${product.title} | TiendaOnline`,
  };
}

export default async function EditProductPage({ params }) {
  // Esperar a que params esté resuelto
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return <ProductForm product={product} />;
}
