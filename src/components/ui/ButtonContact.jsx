import Link from "next/link";
import React from "react";

const ButtonContact = () => {
  return (
    <div>
      <Link
        href="/contact"
        className="bg-black group inline-flex items-center border-2 border-white hover:border-black text-white px-8 py-4 font-medium uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300"
      >
        Contáctanos
      </Link>
    </div>
  );
};

export default ButtonContact;
