import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data";
import ProductForm from "@/components/admin/ProductForm";

export async function generateMetadata({ params }) {
  const product = await getProductById(params.id);

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
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return <ProductForm product={product} />;
}
