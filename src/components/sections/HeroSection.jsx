// src/components/sections/HeroSection.jsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { useHeroImage } from "@/hooks/useSiteConfig";
import { CTAButton } from "@/components/ui";

export default function HeroSection() {
  const { heroImageUrl, isLoading, error } = useHeroImage();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Función para manejar cuando la imagen se carga completamente
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true); // Mostrar contenido aunque falle la imagen
  };

  // Contenido del hero (texto y botón)
  const HeroContent = () => (
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
  );

  return (
    <section className="relative h-screen w-full bg-black text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {!isLoading && heroImageUrl && !imageError ? (
          <>
            {/* Imagen principal */}
            <Image
              src={heroImageUrl}
              alt="Hero background"
              width={1000}
              height={1000}
              style={{ objectFit: "cover" }}
              className={`transition-opacity duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              priority
              quality={85}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {/* Fallback mientras carga */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-pulse" />
            )}
          </>
        ) : (
          /* Gradient de fallback para cuando hay error o está cargando */
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        )}

        {/* Overlay para mejorar legibilidad del texto */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Contenido del Hero */}
      <HeroContent />

      {/* Indicador de carga solo visible si está cargando datos del servidor */}
      {isLoading && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center space-x-2 bg-black/50 rounded-lg px-3 py-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-white">Cargando...</span>
          </div>
        </div>
      )}
    </section>
  );
}
