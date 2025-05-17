import React from "react";

const CTAButton = () => {
  return (
    <div>
      <button
        type="button"
        className="cursor-pointer btn-drop bg-black group inline-flex items-center border-2 border-white hover:border-black text-white px-8 py-4 font-medium uppercase tracking-wider  hover:text-black transition-all duration-300"
        href="/products"
      >
        <span className="flex items-center">Comprar ahora</span>
      </button>
    </div>
  );
};

export default CTAButton;
