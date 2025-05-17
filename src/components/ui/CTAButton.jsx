import React from "react";
import Link from "next/link";

const CTAButton = () => {
  return (
    <div>
      <Link
        href="/products"
        className="cursor-pointer btn-drop bg-black group inline-flex items-center border-2 border-white hover:border-black text-white px-8 py-4 font-medium uppercase tracking-wider hover:text-black transition-all duration-300"
      >
        <span className="flex items-center">Comprar ahora</span>
      </Link>
    </div>
  );
};

export default CTAButton;
