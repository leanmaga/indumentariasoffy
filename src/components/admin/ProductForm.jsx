"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import MultipleImageUploader from "./MultipleImageUploader";

const ProductForm = ({ product = null }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [autoCalculateMargin, setAutoCalculateMargin] = useState(true);

  // Estados para manejar las imágenes
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(
    product?.imageUrl || ""
  );
  const [additionalImages, setAdditionalImages] = useState(
    product?.additionalImages?.map((img) => ({
      imageUrl: img.imageUrl,
      color: img.color,
      preview: img.imageUrl,
    })) || []
  );

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
      // Campos financieros actualizados
      salePrice:
        product?.salePrice?.toString() || product?.price?.toString() || "",
      promoPrice: product?.promoPrice?.toString() || "0",
      cost: product?.cost?.toString() || "",
      profitMargin: product?.profitMargin?.toString() || "",
      stock: product?.stock?.toString() || "",
      category: product?.category || "",
      featured: product?.featured || false,
      // Campos para indumentaria si aplican
      gender: product?.gender || "",
      material: product?.material || "",
      style: product?.style || "",
      season: product?.season || "",
      // Campos para variantes
      sizes: product?.sizes || [],
      colors: product?.colors || [],
      variants: product?.variants || [],
    },
  });

  // Observar los cambios en el formulario
  const watchSalePrice = watch("salePrice");
  const watchCost = watch("cost");
  const watchCategory = watch("category");
  const watchColors = watch("colors"); // Para pasar al selector de imágenes

  // Calcular margen automáticamente cuando cambian precio o costo
  useEffect(() => {
    if (autoCalculateMargin && watchSalePrice && watchCost) {
      const salePrice = parseFloat(watchSalePrice);
      const cost = parseFloat(watchCost);

      if (salePrice > 0 && cost > 0) {
        const margin = ((salePrice - cost) / salePrice) * 100;
        setValue("profitMargin", Math.max(0, Math.min(100, margin)).toFixed(2));
      }
    }
  }, [watchSalePrice, watchCost, autoCalculateMargin, setValue]);

  // Funciones para manejar imágenes
  const handleMainImageChange = (file, preview) => {
    setMainImageFile(file);
    setMainImagePreview(preview);
  };

  const handleAddImage = (file, preview, color) => {
    setAdditionalImages([...additionalImages, { file, preview, color }]);
  };

  const handleRemoveImage = (index) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  // Enviar el formulario
  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Validar imagen principal
      if (!mainImagePreview && !product) {
        toast.error("Debes subir una imagen principal del producto");
        setLoading(false);
        return;
      }

      // Preparar datos para enviar
      const productData = {
        title: data.title,
        description: data.description,
        // Datos financieros
        salePrice: parseFloat(data.salePrice),
        promoPrice: parseFloat(data.promoPrice) || 0,
        cost: parseFloat(data.cost),
        profitMargin: parseFloat(data.profitMargin),
        stock: parseInt(data.stock) || 0,
        category: data.category,
        featured: data.featured,
        // Campos adicionales
        gender: data.gender || "",
        material: data.material || "",
        style: data.style || "",
        season: data.season || "",
      };

      // Subir imagen principal si es nueva
      if (mainImageFile) {
        const imageData = new FormData();
        imageData.append("file", mainImageFile);

        const imageUploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageData,
        });

        if (!imageUploadResponse.ok) {
          const errorData = await imageUploadResponse.json();
          throw new Error(
            errorData.error || "Error al subir la imagen principal"
          );
        }

        const imageResult = await imageUploadResponse.json();
        productData.imageUrl = imageResult.imageUrl;
      } else if (product?.imageUrl) {
        productData.imageUrl = product.imageUrl;
      }

      // Subir imágenes adicionales
      const newAdditionalImages = [];

      // Conservar imágenes adicionales existentes sin archivo
      if (additionalImages) {
        additionalImages.forEach((img) => {
          if (img.imageUrl && !img.file) {
            newAdditionalImages.push({
              imageUrl: img.imageUrl,
              color: img.color || "",
            });
          }
        });
      }

      // Subir nuevas imágenes adicionales con archivo
      for (const img of additionalImages) {
        if (img.file) {
          const imageData = new FormData();
          imageData.append("file", img.file);

          const imageUploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: imageData,
          });

          if (!imageUploadResponse.ok) {
            const errorData = await imageUploadResponse.json();
            throw new Error(
              errorData.error || "Error al subir imagen adicional"
            );
          }

          const imageResult = await imageUploadResponse.json();
          newAdditionalImages.push({
            imageUrl: imageResult.imageUrl,
            color: img.color || "",
          });
        }
      }

      productData.additionalImages = newAdditionalImages;

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

            {/* Sección de precios */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-800 mb-3">
                Información financiera
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="cost"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Costo (ARS)*
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      $
                    </span>
                    <input
                      id="cost"
                      type="number"
                      step="0.01"
                      min="0"
                      className={`w-full pl-7 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.cost ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("cost", {
                        required: "El costo es requerido",
                        min: {
                          value: 0,
                          message: "El costo debe ser mayor o igual a 0",
                        },
                      })}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Costo interno del producto (no visible para clientes)
                  </p>
                  {errors.cost && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.cost.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="salePrice"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Precio de venta (ARS)*
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      $
                    </span>
                    <input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      className={`w-full pl-7 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.salePrice ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("salePrice", {
                        required: "El precio de venta es requerido",
                        min: {
                          value: 0,
                          message: "El precio debe ser mayor a 0",
                        },
                      })}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Precio regular mostrado en la tienda
                  </p>
                  {errors.salePrice && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.salePrice.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="promoPrice"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Precio promocional (ARS)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      $
                    </span>
                    <input
                      id="promoPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      className={`w-full pl-7 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.promoPrice ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("promoPrice", {
                        min: {
                          value: 0,
                          message:
                            "El precio promocional no puede ser negativo",
                        },
                      })}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Precio de oferta (dejar en 0 si no aplica)
                  </p>
                  {errors.promoPrice && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.promoPrice.message}
                    </p>
                  )}
                </div>

                {/* Margen de ganancia */}
                <div>
                  <div className="flex justify-between">
                    <label
                      htmlFor="profitMargin"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Margen de ganancia (%)*
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoCalculate"
                        checked={autoCalculateMargin}
                        onChange={() =>
                          setAutoCalculateMargin(!autoCalculateMargin)
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="autoCalculate"
                        className="ml-2 text-xs text-gray-600"
                      >
                        Calcular automáticamente
                      </label>
                    </div>
                  </div>
                  <input
                    type="number"
                    id="profitMargin"
                    step="0.01"
                    min="0"
                    max="100"
                    disabled={autoCalculateMargin}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.profitMargin ? "border-red-500" : "border-gray-300"
                    } ${autoCalculateMargin ? "bg-gray-100" : ""}`}
                    {...register("profitMargin", {
                      required: "El margen de ganancia es requerido",
                      min: {
                        value: 0,
                        message: "El margen debe ser mayor o igual a 0",
                      },
                      max: {
                        value: 100,
                        message: "El margen no puede exceder el 100%",
                      },
                    })}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {autoCalculateMargin
                      ? "Calculado como: (precio venta - costo) / precio venta * 100"
                      : "Ingrese el margen manualmente (0-100%)"}
                  </p>
                  {errors.profitMargin && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.profitMargin.message}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label
                    htmlFor="stock"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Stock*
                  </label>
                  <input
                    type="number"
                    id="stock"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.stock ? "border-red-500" : "border-gray-300"
                    }`}
                    {...register("stock", {
                      required: "El stock es requerido",
                      min: {
                        value: 0,
                        message: "El stock no puede ser negativo",
                      },
                    })}
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.stock.message}
                    </p>
                  )}
                </div>
              </div>
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
                <option value="ropa">Ropa (General)</option>
                <option value="camisetas">Camisetas</option>
                <option value="pantalones">Pantalones</option>
                <option value="abrigos">Abrigos</option>
                <option value="calzado">Calzado</option>
                <option value="accesorios">Accesorios</option>
                <option value="electronica">Electrónica</option>
                <option value="hogar">Hogar</option>
                <option value="deporte">Deporte</option>
                <option value="otros">Otros</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Gestor de múltiples imágenes */}
            <MultipleImageUploader
              mainImage={mainImagePreview}
              additionalImages={additionalImages}
              onMainImageChange={handleMainImageChange}
              onAddImage={handleAddImage}
              onRemoveImage={handleRemoveImage}
              colors={watchColors || []}
            />

            {/* Sección de campos adicionales según categoría */}
            {[
              "ropa",
              "camisetas",
              "pantalones",
              "abrigos",
              "calzado",
              "accesorios",
            ].includes(watchCategory) && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Detalles adicionales
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Género
                    </label>
                    <select
                      id="gender"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
                      {...register("gender")}
                    >
                      <option value="">Seleccionar</option>
                      <option value="hombre">Hombre</option>
                      <option value="mujer">Mujer</option>
                      <option value="unisex">Unisex</option>
                      <option value="niños">Niños</option>
                      <option value="niñas">Niñas</option>
                      <option value="bebés">Bebés</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="material"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Material
                    </label>
                    <input
                      type="text"
                      id="material"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
                      placeholder="Ej: Algodón, Poliéster, Lana..."
                      {...register("material")}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-4">
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
                  Producto destacado (aparecerá en la página principal)
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
