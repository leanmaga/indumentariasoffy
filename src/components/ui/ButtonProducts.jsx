import Link from "next/link";
import React from "react";

const ButtonProducts = () => {
  return (
    <div>
      <Link
        href="/products"
        className="bg-black group inline-flex items-center border-2 border-white hover:border-black text-white px-8 py-4 font-medium uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300"
      >
        Ver todos los productos
      </Link>
    </div>
  );
};

export default ButtonProducts;
