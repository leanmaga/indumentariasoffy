// src/components/admin/HeroImageUpload.js - Ajustado para App Router
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function HeroImageUpload() {
  const [currentImage, setCurrentImage] = useState("/default-hero.jpg");
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Cargar imagen actual al montar el componente
  useEffect(() => {
    fetchCurrentImage();
  }, []);

  const fetchCurrentImage = async () => {
    try {
      const response = await fetch("/api/admin/hero-image");
      const data = await response.json();
      setCurrentImage(data.imageUrl);
    } catch (error) {
      console.error("Error al cargar imagen actual:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido");
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen debe ser menor a 5MB");
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!previewImage) return;

    setIsUploading(true);
    try {
      const response = await fetch("/api/admin/hero-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: previewImage,
          deleteOld: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentImage(data.imageUrl);
        setPreviewImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        alert("Imagen del hero actualizada correctamente");

        // Opcional: Recargar la página principal para ver los cambios inmediatamente
        // window.location.reload();
      } else {
        alert("Error al subir la imagen: " + data.error);
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const cancelPreview = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Gestionar Imagen del Hero
      </h2>

      {/* Imagen Actual */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Imagen Actual
        </h3>
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={currentImage}
            alt="Imagen actual del hero"
            fill
            className="object-cover"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">URL actual: {currentImage}</p>
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Subir Nueva Imagen
        </h3>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            ref={fileInputRef}
            className="hidden"
            id="heroImageInput"
          />

          <label htmlFor="heroImageInput" className="cursor-pointer block">
            <div className="text-gray-500 mb-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              Haz clic para seleccionar una imagen
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF hasta 5MB
            </p>
          </label>
        </div>
      </div>

      {/* Preview */}
      {previewImage && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Vista Previa
          </h3>
          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
            <Image
              src={previewImage}
              alt="Vista previa"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={uploadImage}
              disabled={isUploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Subiendo...
                </>
              ) : (
                "Confirmar Cambio"
              )}
            </button>

            <button
              onClick={cancelPreview}
              disabled={isUploading}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Recomendaciones:</strong> Para mejores resultados, usa una
          imagen de al menos 1920x1080px. La imagen se mostrará con una opacidad
          del 50% sobre un fondo negro.
        </p>
      </div>

      {/* Preview del resultado final */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Preview del Hero Section
        </h4>
        <div className="relative h-32 bg-black rounded-lg overflow-hidden">
          <Image
            src={previewImage || currentImage}
            alt="Preview del hero"
            fill
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <h1 className="text-xl font-bold">PRODUCTOS</h1>
              <h1 className="text-xl font-bold">AL MEJOR PRECIO</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
