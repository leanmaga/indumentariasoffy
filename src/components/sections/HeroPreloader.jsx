// src/components/sections/HeroPreloader.jsx
"use client";

import { useEffect } from "react";
import { useHeroImage } from "@/hooks/useSiteConfig";

/**
 * Componente que preload la imagen del hero para mejorar la experiencia de usuario
 * Debe colocarse en el layout principal para que cargue antes de que se necesite
 */
export default function HeroPreloader() {
  const { heroImageUrl, isLoading } = useHeroImage();

  useEffect(() => {
    if (!isLoading && heroImageUrl && heroImageUrl !== "/default-hero.webp") {
      // Preload de la imagen del hero
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = heroImageUrl;
      link.crossOrigin = "anonymous";

      // Añadir al head si no existe ya
      const existingPreload = document.querySelector(
        `link[href="${heroImageUrl}"]`
      );
      if (!existingPreload) {
        document.head.appendChild(link);
      }

      // Limpiar preloads anteriores para evitar acumulación
      return () => {
        const preloadLinks = document.querySelectorAll(
          'link[rel="preload"][as="image"]'
        );
        preloadLinks.forEach((linkEl) => {
          if (
            linkEl.href !== heroImageUrl &&
            linkEl.href.includes("cloudinary")
          ) {
            document.head.removeChild(linkEl);
          }
        });
      };
    }
  }, [heroImageUrl, isLoading]);

  // Este componente no renderiza nada visualmente
  return null;
}

// Hook para usar en otros componentes que necesiten saber si la imagen está preloaded
export function useIsHeroImagePreloaded() {
  const { heroImageUrl } = useHeroImage();

  useEffect(() => {
    if (heroImageUrl && heroImageUrl !== "/default-hero.webp") {
      // Crear una imagen temporal para verificar si está en caché
      const img = new Image();
      img.src = heroImageUrl;

      // Si se carga inmediatamente, probablemente está en caché
      if (img.complete) {
        return true;
      }
    }

    return false;
  }, [heroImageUrl]);
}
