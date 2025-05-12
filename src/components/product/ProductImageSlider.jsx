"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

export default function ProductImageSlider({ images, product }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesArray, setImagesArray] = useState([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Preparar array de imágenes desde diferentes formatos de props
      let imagesList = [];

      if (Array.isArray(images) && images.length > 0) {
        // El caso más común: se pasa un array de URLs de imágenes
        imagesList = images.filter((img) => !!img);
      } else if (product?.imageUrl) {
        // Si tenemos un objeto producto con imageUrl
        imagesList = [product.imageUrl];

        if (Array.isArray(product.additionalImages)) {
          product.additionalImages.forEach((img) => {
            if (img && img.imageUrl) {
              imagesList.push(img.imageUrl);
            }
          });
        }
      }

      // Añadir placeholder si no hay imágenes
      if (imagesList.length === 0) {
        imagesList = ["/placeholder.png"];
      }

      // Verificar que todas las URLs sean válidas
      const validImagesList = imagesList.filter((url) => {
        return typeof url === "string" && url.length > 0;
      });

      setImagesArray(validImagesList);
    } catch (err) {
      console.error("Error processing images:", err);
      setError("Error al cargar las imágenes");
      setImagesArray(["/placeholder.png"]);
    }
  }, [images, product]);

  // Navegación
  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === imagesArray.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? imagesArray.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Manejo de zoom
  const handleMouseMove = (e) => {
    if (!isZoomed) return;

    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape" && isZoomed) {
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomed]);

  // Formato de contador 01/15 - estilo drop.com
  const imagePosition = `${String(currentIndex + 1).padStart(2, "0")}/${String(
    imagesArray.length
  ).padStart(2, "0")}`;

  // Mostrar indicador de carga mientras las imágenes se preparan
  if (error) {
    return (
      <div className="relative w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (imagesArray.length === 0) {
    return (
      <div className="relative w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Contenedor principal de la imagen */}
      <div
        className={`relative overflow-hidden rounded-lg ${
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        style={{ height: "500px" }}
        onClick={toggleZoom}
        onMouseMove={handleMouseMove}
      >
        {/* Imagen actual */}
        <div className="absolute inset-0 bg-gray-50">
          <Image
            src={imagesArray[currentIndex] || "/placeholder.png"}
            alt={`Imagen del producto ${currentIndex + 1}`}
            className={`object-contain transition-transform duration-300 ${
              isZoomed ? "scale-150" : "scale-100"
            }`}
            style={
              isZoomed
                ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                : {}
            }
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={currentIndex === 0}
          />
        </div>

        {/* Botón de zoom - Estilo drop.com */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleZoom();
          }}
          className="absolute top-2 right-2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition-colors z-10"
          aria-label={isZoomed ? "Reducir zoom" : "Ampliar zoom"}
        >
          <ArrowsPointingOutIcon className="h-5 w-5 text-gray-800" />
        </button>

        {/* Contador de imágenes - Estilo drop.com */}
        {imagesArray.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white py-1 px-3 rounded-full text-sm font-medium z-10">
            {imagePosition}
          </div>
        )}
      </div>

      {/* Navegación con flechas - Solo si hay más de una imagen */}
      {imagesArray.length > 1 && (
        <div className="flex justify-between absolute left-2 right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="bg-white/80 rounded-full p-2 shadow hover:bg-white transition-colors z-10 pointer-events-auto"
            aria-label="Imagen anterior"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="bg-white/80 rounded-full p-2 shadow hover:bg-white transition-colors z-10 pointer-events-auto"
            aria-label="Imagen siguiente"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-800" />
          </button>
        </div>
      )}

      {/* Miniaturas - Estilo drop.com */}
      {imagesArray.length > 1 && (
        <div className="mt-4 relative">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {imagesArray.map((image, index) => (
              <div
                key={`thumb-${index}`}
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 cursor-pointer rounded-md overflow-hidden transition-all
                  ${
                    currentIndex === index
                      ? "ring-2 ring-black h-20 w-20"
                      : "border border-gray-200 h-16 w-16 opacity-70 hover:opacity-100"
                  }`}
              >
                <Image
                  src={image || "/placeholder.png"}
                  alt={`Miniatura ${index + 1}`}
                  className="object-cover"
                  fill
                  sizes="80px"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
