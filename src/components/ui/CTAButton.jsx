import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";

const CTAButton = () => {
  return (
    <div>
      <Link
        href="/products"
        className="group inline-flex items-center bg-transparent border-2 border-white text-white px-8 py-4 font-medium uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300"
      >
        Comprar ahora
        <ShoppingBagIcon className="ml-3 h-5 w-5 group-hover:text-black" />
      </Link>
    </div>
  );
};

export default CTAButton;
