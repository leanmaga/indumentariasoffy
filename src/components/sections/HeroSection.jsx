// src/components/sections/HeroSection.jsx
"use client";

import Image from "next/image";
import { useHeroImage } from "@/hooks/useSiteConfig";
import { CTAButton } from "@/components/ui";

export default function HeroSection() {
  const { heroImageUrl, isLoading } = useHeroImage();

  if (isLoading) {
    return (
      <section className="relative h-screen w-full bg-black text-white overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gray-800 animate-pulse"></div>
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-5xl">
            <h1 className="font-drop font-black uppercase leading-none mb-8">
              <span className="block text-[12vw] xl:text-[10vw] tracking-tighter">
                PRODUCTOS
              </span>
              <span className="block text-[12vw] xl:text-[10vw] tracking-tighter">
                AL MEJOR PRECIO
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-medium mb-8 tracking-wider uppercase">
              Todo lo que buscas en un solo lugar.
            </p>
            <CTAButton />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen w-full bg-black text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImageUrl}
          alt="Hero background"
          width={1000}
          height={1000}
          className="object-cover opacity-50"
          priority
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-5xl">
          <h1 className="font-drop font-black uppercase leading-none mb-8">
            <span className="block text-[12vw] xl:text-[10vw] tracking-tighter">
              PRODUCTOS
            </span>
            <span className="block text-[12vw] xl:text-[10vw] tracking-tighter">
              AL MEJOR PRECIO
            </span>
          </h1>

          <p className="text-xl md:text-2xl font-medium mb-8 tracking-wider uppercase">
            Todo lo que buscas en un solo lugar.
          </p>

          <CTAButton />
        </div>
      </div>
    </section>
  );
}
