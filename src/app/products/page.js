// src/app/products/page.tsx  (server component)
import { getProducts } from "@/lib/data";
import FilterableProducts from "@/components/product/FilterableProducts";

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams; // ADD THIS LINE
  const { category = "all" } = resolvedSearchParams; // CHANGE THIS LINE
  const { products } = await getProducts({ category });
  return <FilterableProducts products={products} />;
}
