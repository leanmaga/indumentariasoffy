// src/hooks/useSiteConfig.js
"use client";

import { useState, useEffect } from "react";

export function useSiteConfig() {
  const [config, setConfig] = useState({
    storeName: "Indumentaria Soffy",
    contactEmail: "patagoniascript@indumentariasoffy.com",
    storeDescription: "Encuentra los mejores productos al mejor precio.",
    heroImageUrl: "/default-hero.jpg",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      // Obtener configuración general y hero en paralelo
      const [generalResponse, heroResponse] = await Promise.all([
        fetch("/api/admin/general-settings"),
        fetch("/api/admin/hero-image"),
      ]);

      const [generalData, heroData] = await Promise.all([
        generalResponse.json(),
        heroResponse.json(),
      ]);

      if (generalResponse.ok && heroResponse.ok) {
        setConfig({
          storeName: generalData.storeName || "Indumentaria Soffy",
          contactEmail:
            generalData.contactEmail || "patagoniascript@indumentariasoffy.com",
          storeDescription:
            generalData.storeDescription ||
            "Encuentra los mejores productos al mejor precio.",
          heroImageUrl: heroData.imageUrl || "/default-hero.jpg",
        });
      } else {
        // Si hay error, usar solo los datos que funcionen
        if (generalResponse.ok) {
          setConfig((prev) => ({
            ...prev,
            storeName: generalData.storeName || prev.storeName,
            contactEmail: generalData.contactEmail || prev.contactEmail,
            storeDescription:
              generalData.storeDescription || prev.storeDescription,
          }));
        }
        if (heroResponse.ok) {
          setConfig((prev) => ({
            ...prev,
            heroImageUrl: heroData.imageUrl || prev.heroImageUrl,
          }));
        }
      }
    } catch (error) {
      console.error("Error al cargar configuración del sitio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { config, isLoading, refetch: fetchConfig };
}

// Hook específico solo para configuración general (más ligero)
export function useGeneralSettings() {
  const [settings, setSettings] = useState({
    storeName: "",
    contactEmail: "",
    storeDescription: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/general-settings");
      const data = await response.json();

      if (response.ok) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error al cargar configuración general:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { settings, isLoading, refetch: fetchSettings };
}

// Hook específico para la imagen hero
export function useHeroImage() {
  const [heroImageUrl, setHeroImageUrl] = useState("/default-hero.jpg");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHeroImage();
  }, []);

  const fetchHeroImage = async () => {
    try {
      const response = await fetch("/api/admin/hero-image");
      const data = await response.json();

      if (response.ok) {
        setHeroImageUrl(data.imageUrl);
      }
    } catch (error) {
      console.error("Error al cargar imagen hero:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { heroImageUrl, isLoading, refetch: fetchHeroImage };
}
