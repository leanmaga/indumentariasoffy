"use client";

import { useState } from "react";
import {
  XCircleIcon,
  PlusCircleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

export default function MultipleImageUploader({
  mainImage,
  additionalImages = [],
  onMainImageChange,
  onAddImage,
  onRemoveImage,
  colors = [],
}) {
  const [newImage, setNewImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen debe ser menor a 5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("El archivo debe ser una imagen (JPG, PNG o WebP)");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewImage({
        file,
        preview: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddImage = () => {
    if (!newImage) return;
    onAddImage(newImage.file, newImage.preview, selectedColor);
    setNewImage(null);
    setSelectedColor("");
  };

  return (
    <div className="space-y-6">
      {/* Main image */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Imagen principal *
        </h3>
        <div
          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
          onClick={() => document.getElementById("mainImage").click()}
        >
          {mainImage ? (
            <div className="relative w-full h-40">
              <img
                src={mainImage}
                alt="Imagen principal"
                className="mx-auto max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="py-8">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-1 text-sm text-gray-500">
                Haz clic para seleccionar la imagen principal
              </p>
            </div>
          )}
          <input
            id="mainImage"
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onloadend = () => {
                onMainImageChange(file, reader.result);
              };
              reader.readAsDataURL(file);
            }}
          />
        </div>
      </div>

      {/* Additional images */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Imágenes adicionales
        </h3>

        {/* Already added images */}
        {additionalImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {additionalImages.map((img, index) => (
              <div key={index} className="relative group">
                <div className="relative h-32 rounded overflow-hidden border">
                  {/* Using img instead of Next.js Image */}
                  <img
                    src={img.preview || img.imageUrl}
                    alt={`Imagen adicional ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {img.color && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-white text-xs rounded shadow">
                    {img.color}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-100 transition-colors"
                >
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new image */}
        <div className="border rounded p-4">
          <div className="mb-4">
            {newImage ? (
              <div className="relative h-32 rounded overflow-hidden">
                <img
                  src={newImage.preview}
                  alt="Nueva imagen"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setNewImage(null)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-100 transition-colors"
                >
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  document.getElementById("additionalImage").click()
                }
              >
                <PlusCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-1 text-sm text-gray-500">
                  Haz clic para seleccionar una imagen adicional
                </p>
              </div>
            )}
            <input
              id="additionalImage"
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />
          </div>

          {newImage && (
            <>
              {colors.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asociar a color (opcional)
                  </label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Sin color específico</option>
                    {colors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddImage}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Agregar imagen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
