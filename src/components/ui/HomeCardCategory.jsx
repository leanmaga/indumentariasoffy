import Image from "next/image";
import Link from "next/link";
import React from "react";

const HomeCardCategory = ({ name, category, imageSrc }) => {
  return (
    <Link href={`/products?category=${category}`} className="group block">
      <div className="relative aspect-square mb-3 overflow-hidden">
        <Image
          src={imageSrc}
          alt={name}
          width={200}
          height={200}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex items-center">
        <span className="text-base font-medium font-drop">{name}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 ml-2 transform transition-transform group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
};

export default HomeCardCategory;
