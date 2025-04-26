import ProductForm from "@/components/admin/ProductForm";

export const metadata = {
  title: "Agregar Producto | TiendaOnline",
  description: "Agrega un nuevo producto a tu tienda en línea.",
};

export default function NewProductPage() {
  return <ProductForm />;
}
