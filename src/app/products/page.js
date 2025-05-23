// src/app/products/page.tsx  (server component)
import { getProducts } from "@/lib/data";
import FilterableProducts from "@/components/product/FilterableProducts";

export default async function ProductsPage({ searchParams }) {
  const { category = "all" } = await searchParams;
  const { products } = await getProducts({ category });
  return <FilterableProducts products={products} />;
}
