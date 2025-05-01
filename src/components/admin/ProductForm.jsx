"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { CameraIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const ProductForm = ({ product = null }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || "");
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: product?.title || "",
      description: product?.description || "",
      price: product?.price || "",
      category: product?.category || "",
      inStock: product?.inStock !== undefined ? product.inStock : true,
      featured: product?.featured || false,
    },
  });

  // Observar los cambios en el formulario
  const watchCategory = watch("category");

  // Convertir archivo a Base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Manejar la carga de imágenes
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("El archivo debe ser una imagen (JPG, PNG o WebP)");
      return;
    }

    setImageFile(file);

    // Crear vista previa
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Enviar el formulario
  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Verificar si se necesita cargar imagen
      if (!imagePreview && !product) {
        toast.error("Debes subir una imagen del producto");
        setLoading(false);
        return;
      }

      // Preparar datos para enviar
      const productData = {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        inStock: data.inStock,
        featured: data.featured,
      };

      // Añadir imagen en base64 si hay una nueva
      if (imageFile) {
        const imageBase64 = await convertFileToBase64(imageFile);
        productData.image = imageBase64;
      }

      // Determinar si es crear o actualizar
      const url = product ? `/api/products/${product._id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al guardar producto");
      }

      toast.success(
        product
          ? "Producto actualizado correctamente"
          : "Producto creado correctamente"
      );

      // Redireccionar a la lista de productos
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center text-indigo-600 hover:text-indigo-800"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Volver
      </button>

      <h1 className="text-2xl font-semibold mb-6">
        {product ? "Editar Producto" : "Agregar Nuevo Producto"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Título del Producto*
              </label>
              <input
                id="title"
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                {...register("title", { required: "El título es requerido" })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descripción*
              </label>
              <textarea
                id="description"
                rows="5"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                {...register("description", {
                  required: "La descripción es requerida",
                })}
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Precio*
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`w-full pl-7 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("price", {
                    required: "El precio es requerido",
                    min: {
                      value: 0,
                      message: "El precio debe ser mayor a 0",
                    },
                    valueAsNumber: true,
                  })}
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Categoría*
              </label>
              <select
                id="category"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
                {...register("category", {
                  required: "La categoría es requerida",
                })}
              >
                <option value="">Selecciona una categoría</option>
                <option value="ropa">Ropa</option>
                <option value="electronica">Electrónica</option>
                <option value="hogar">Hogar</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 mb-3">
                Imagen del Producto*
              </span>

              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition"
                onClick={() => document.getElementById("image").click()}
              >
                {imagePreview ? (
                  <div className="relative h-40 mx-auto">
                    <Image
                      src={imagePreview}
                      alt="Vista previa"
                      width={200}
                      height={200}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="py-8">
                    <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Haz clic para seleccionar una imagen
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, WebP - Máx. 5MB
                    </p>
                  </div>
                )}

                <input
                  id="image"
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {imagePreview && (
                <button
                  type="button"
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                  onClick={() => {
                    setImagePreview("");
                    setImageFile(null);
                  }}
                >
                  Eliminar imagen
                </button>
              )}
            </div>

            <div className="flex space-x-6">
              <div className="flex items-center">
                <input
                  id="inStock"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  {...register("inStock")}
                />
                <label
                  htmlFor="inStock"
                  className="ml-2 block text-sm text-gray-700"
                >
                  En Stock
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="featured"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  {...register("featured")}
                />
                <label
                  htmlFor="featured"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Destacado
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition mr-4"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </span>
            ) : (
              "Guardar Producto"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
