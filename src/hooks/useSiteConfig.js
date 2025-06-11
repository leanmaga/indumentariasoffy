// src/hooks/useSiteConfig.js
"use client";

import { useState, useEffect, useCallback } from "react";

// Cache global para evitar múltiples requests
const imageCache = {
  heroImage: null,
  timestamp: null,
  isLoading: false,
};

// Tiempo de caché en milisegundos (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000;

export function useHeroImage() {
  const [heroImageUrl, setHeroImageUrl] = useState("/default-hero.webp");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHeroImage = useCallback(async (force = false) => {
    const now = Date.now();

    // Verificar si tenemos datos en caché y son válidos
    if (
      !force &&
      imageCache.heroImage &&
      imageCache.timestamp &&
      now - imageCache.timestamp < CACHE_DURATION
    ) {
      setHeroImageUrl(imageCache.heroImage);
      setIsLoading(false);
      return;
    }

    // Evitar múltiples requests simultáneos
    if (imageCache.isLoading) {
      return;
    }

    imageCache.isLoading = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/hero-image", {
        method: "GET",
        // Añadir headers para evitar caché del navegador cuando queremos datos frescos
        headers: force
          ? {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            }
          : {},
      });

      if (!response.ok) {
        throw new Error("Error al cargar la imagen");
      }

      const data = await response.json();

      // Actualizar caché
      imageCache.heroImage = data.imageUrl;
      imageCache.timestamp = now;

      setHeroImageUrl(data.imageUrl);
    } catch (err) {
      console.error("Error fetching hero image:", err);
      setError(err.message);
      // En caso de error, mantener la imagen por defecto
      setHeroImageUrl("/default-hero.webp");
    } finally {
      setIsLoading(false);
      imageCache.isLoading = false;
    }
  }, []);

  // Función para invalidar caché (útil después de subir nueva imagen)
  const invalidateCache = useCallback(() => {
    imageCache.heroImage = null;
    imageCache.timestamp = null;
    fetchHeroImage(true);
  }, [fetchHeroImage]);

  useEffect(() => {
    fetchHeroImage();

    // Escuchar eventos de actualización de imagen
    const handleImageUpdate = (event) => {
      if (event.detail?.imageUrl) {
        // Actualizar inmediatamente con la nueva URL
        setHeroImageUrl(event.detail.imageUrl);
        // También actualizar el caché
        imageCache.heroImage = event.detail.imageUrl;
        imageCache.timestamp = Date.now();
      }
    };

    window.addEventListener("heroImageUpdated", handleImageUpdate);

    // Conectar con el sistema de invalidación global del upload component
    if (typeof window !== "undefined") {
      // Importar dinámicamente para evitar problemas de SSR
      import("@/components/admin/HeroImageUpload")
        .then((module) => {
          if (module.setHeroCacheInvalidator) {
            module.setHeroCacheInvalidator(invalidateCache);
          }
        })
        .catch(() => {
          // Silenciar error si el componente no está disponible
        });
    }

    return () => {
      window.removeEventListener("heroImageUpdated", handleImageUpdate);
    };
  }, [fetchHeroImage, invalidateCache]);

  return {
    heroImageUrl,
    isLoading,
    error,
    refetch: () => fetchHeroImage(true),
    invalidateCache,
  };
}
