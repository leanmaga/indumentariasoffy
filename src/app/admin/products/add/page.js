"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  XCircleIcon,
  PlusCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import MultipleImageUploader from "@/components/admin/MultipleImageUploader";

export default function AddProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // 🔧 ESTADOS CORREGIDOS - Solo URLs de Cloudinary, NO archivos
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [mainImageInfo, setMainImageInfo] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    // Precio de venta es obligatorio, los demás son opcionales
    salePrice: "",
    promoPrice: "",
    cost: "",
    profitMargin: "",
    stock: "",
    category: "", // Sin valor por defecto para forzar selección
    featured: false,
    // Campos para indumentaria
    sizes: [],
    colors: [],
    variants: [],
    gender: "",
    material: "",
    style: "",
    season: "",
    // Campos para pantalones
    waistType: "",
    fit: "",
    // Campos para calzado
    heelHeight: "",
    soleType: "",
  });

  // Estado para calcular automáticamente el margen
  const [autoCalculateMargin, setAutoCalculateMargin] = useState(true);
  const [showFinancialInfo, setShowFinancialInfo] = useState(false);

  // Estado para opciones de talle y color
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [showVariants, setShowVariants] = useState(false);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [clothingType, setClothingType] = useState("");

  // Opciones predefinidas de talles y colores por categoría
  const sizeOptions = {
    camisetas: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    pantalones: ["36", "38", "40", "42", "44", "46", "48", "50", "52", "54"],
    calzado: [
      "35",
      "36",
      "37",
      "38",
      "39",
      "40",
      "41",
      "42",
      "43",
      "44",
      "45",
      "46",
    ],
    abrigos: ["XS", "S", "M", "L", "XL", "XXL"],
    accesorios: ["Único"],
  };

  const commonColors = [
    "Negro",
    "Blanco",
    "Azul",
    "Rojo",
    "Gris",
    "Marrón",
    "Verde",
    "Amarillo",
    "Naranja",
    "Púrpura",
    "Rosa",
    "Beige",
    "Navy",
    "Khaki",
  ];

  const genderOptions = [
    "hombre",
    "mujer",
    "unisex",
    "niños",
    "niñas",
    "bebés",
  ];

  const seasonOptions = ["verano", "invierno", "primavera", "otoño", "todas"];
  const waistTypeOptions = ["regular", "alto", "bajo"];
  const fitOptions = [
    "skinny",
    "slim",
    "regular",
    "relaxed",
    "bootcut",
    "wide",
  ];

  // Categorías que usan variantes (talle + color)
  const variantCategories = ["camisetas", "pantalones", "calzado", "abrigos"];

  // Categorías que usan campos específicos
  const clothingCategories = [
    "camisetas",
    "pantalones",
    "calzado",
    "abrigos",
    "accesorios",
  ];

  // Efecto para calcular el margen automáticamente
  useEffect(() => {
    if (autoCalculateMargin && formData.salePrice && formData.cost) {
      const cost = parseFloat(formData.cost);
      const salePrice = parseFloat(formData.salePrice);

      if (cost > 0 && salePrice > 0) {
        const margin = ((salePrice - cost) / salePrice) * 100;
        setFormData((prev) => ({
          ...prev,
          profitMargin: Math.max(0, Math.min(100, margin)).toFixed(2),
        }));
      }
    }
  }, [formData.salePrice, formData.cost, autoCalculateMargin]);

  // Efecto para mostrar campos específicos según la categoría
  useEffect(() => {
    const needsVariants = variantCategories.includes(formData.category);
    const isClothing = clothingCategories.includes(formData.category);

    setShowVariants(needsVariants);
    setShowExtraFields(isClothing);
    setClothingType(formData.category);

    // Si cambia la categoría y no necesita variantes, limpiar las variantes
    if (!needsVariants) {
      setFormData((prev) => ({
        ...prev,
        sizes: [],
        colors: [],
        variants: [],
      }));
    }
  }, [formData.category, clothingCategories, variantCategories]);

  // Efecto para autogenerar variantes cuando cambian talles o colores
  useEffect(() => {
    if (
      showVariants &&
      formData.sizes.length > 0 &&
      formData.colors.length > 0
    ) {
      const newVariants = [];
      formData.sizes.forEach((size) => {
        formData.colors.forEach((color) => {
          const existingVariant = formData.variants.find(
            (v) => v.size === size && v.color === color
          );

          if (existingVariant) {
            newVariants.push(existingVariant);
          } else {
            newVariants.push({
              size,
              color,
              stock: 0,
            });
          }
        });
      });

      setFormData((prev) => ({
        ...prev,
        variants: newVariants,
      }));
    }
  }, [showVariants, formData.sizes, formData.colors, formData.variants]);

  // Usar useEffect para la redirección
  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && session?.user?.role !== "admin")
    ) {
      router.push("/auth/signin?callbackUrl=/admin");
    }
  }, [status, session, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Limpiar error de validación cuando el usuario empieza a escribir
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 🔧 FUNCIONES CORREGIDAS - Manejar URLs de Cloudinary directamente
  const handleMainImageChange = (info, imageUrl, color) => {
    setMainImageUrl(imageUrl);
    setMainImageInfo(info);

    // Limpiar error de imagen
    if (validationErrors.image) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  };

  const handleAddImage = (info, imageUrl, color) => {
    const newImage = {
      imageUrl,
      color: color || "",
      info,
    };
    setAdditionalImages((prev) => [...prev, newImage]);
  };

  const handleRemoveImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Manejar cambio en el stock de una variante
  const handleVariantStockChange = (index, newStock) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      stock: parseInt(newStock) || 0,
    };

    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  // Agregar un nuevo talle
  const handleAddSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, newSize],
      }));
      setNewSize("");
    }
  };

  // Agregar un nuevo color
  const handleAddColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor],
      }));
      setNewColor("");
    }
  };

  // Eliminar un talle
  const handleRemoveSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }));
  };

  // Eliminar un color
  const handleRemoveColor = (color) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }));
  };

  // Agregar un talle predefinido
  const handleAddPredefinedSize = (size) => {
    if (!formData.sizes.includes(size)) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, size],
      }));
    }
  };

  // Agregar un color predefinido
  const handleAddPredefinedColor = (color) => {
    if (!formData.colors.includes(color)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, color],
      }));
    }
  };

  // Función de validación
  const validateForm = () => {
    const errors = {};

    // Validar campos obligatorios
    if (!formData.title.trim()) {
      errors.title = "El nombre del producto es obligatorio";
    }

    if (!formData.category) {
      errors.category = "Debes seleccionar una categoría";
    }

    if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
      errors.salePrice =
        "El precio de venta es obligatorio y debe ser mayor a 0";
    }

    // 🔧 VALIDACIÓN CORREGIDA - Verificar URL de imagen, no archivo
    if (!mainImageUrl) {
      errors.image = "Debes subir una imagen principal del producto";
    }

    // Validaciones opcionales solo si se proporcionan valores
    if (formData.cost && parseFloat(formData.cost) < 0) {
      errors.cost = "El costo no puede ser negativo";
    }

    if (
      formData.profitMargin &&
      (parseFloat(formData.profitMargin) < 0 ||
        parseFloat(formData.profitMargin) > 100)
    ) {
      errors.profitMargin = "El margen debe estar entre 0 y 100%";
    }

    if (formData.promoPrice && parseFloat(formData.promoPrice) < 0) {
      errors.promoPrice = "El precio promocional no puede ser negativo";
    }

    // Validar stock según la categoría
    if (!showVariants) {
      if (formData.stock && parseInt(formData.stock) < 0) {
        errors.stock = "El stock no puede ser negativo";
      }
    } else {
      // Para productos con variantes, validar si hay talles y colores (opcional)
      if (formData.sizes.length > 0 || formData.colors.length > 0) {
        if (formData.sizes.length === 0) {
          errors.sizes = "Si agregas colores, debes agregar al menos un talle";
        }
        if (formData.colors.length === 0) {
          errors.colors = "Si agregas talles, debes agregar al menos un color";
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 🔧 FUNCIÓN HANDLESUBMIT CORREGIDA - Sin subida de archivos
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario
    if (!validateForm()) {
      toast.error("Por favor completa todos los campos obligatorios");

      // Scroll al primer error
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // 🎯 PREPARAR DATOS - Solo URLs, no archivos
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        salePrice: parseFloat(formData.salePrice),
        category: formData.category,
        featured: formData.featured,
      };

      // 🔧 IMAGEN PRINCIPAL - URL directa de Cloudinary
      if (mainImageUrl) {
        productData.imageUrl = mainImageUrl;

        // Agregar info de Cloudinary si está disponible
        if (mainImageInfo) {
          productData.imageCloudinaryInfo = {
            publicId: mainImageInfo.public_id,
            format: mainImageInfo.format,
            width: mainImageInfo.width,
            height: mainImageInfo.height,
            bytes: mainImageInfo.bytes,
          };
        }
      }

      // 🔧 IMÁGENES ADICIONALES - URLs directas de Cloudinary
      productData.additionalImages = additionalImages.map((img) => ({
        imageUrl: img.imageUrl,
        color: img.color || "",
        // Agregar info de Cloudinary si está disponible
        ...(img.info && {
          imageCloudinaryInfo: {
            publicId: img.info.public_id,
            format: img.info.format,
            width: img.info.width,
            height: img.info.height,
            bytes: img.info.bytes,
          },
        }),
      }));

      // Solo agregar campos financieros opcionales si tienen valor
      if (formData.promoPrice) {
        productData.promoPrice = parseFloat(formData.promoPrice);
      }

      if (formData.cost) {
        productData.cost = parseFloat(formData.cost);
      }

      if (formData.profitMargin) {
        productData.profitMargin = parseFloat(formData.profitMargin);
      }

      // Campos de indumentaria (solo si tienen valor)
      if (formData.gender) productData.gender = formData.gender;
      if (formData.material) productData.material = formData.material;
      if (formData.style) productData.style = formData.style;
      if (formData.season) productData.season = formData.season;

      // Campos específicos
      if (formData.waistType) productData.waistType = formData.waistType;
      if (formData.fit) productData.fit = formData.fit;
      if (formData.heelHeight)
        productData.heelHeight = parseFloat(formData.heelHeight);
      if (formData.soleType) productData.soleType = formData.soleType;

      // Agregar talles, colores y variantes si corresponde
      if (
        showVariants &&
        formData.sizes.length > 0 &&
        formData.colors.length > 0
      ) {
        productData.sizes = formData.sizes;
        productData.colors = formData.colors;
        productData.variants = formData.variants;
        productData.stock = formData.variants.reduce(
          (sum, variant) => sum + variant.stock,
          0
        );
      } else if (formData.stock) {
        productData.stock = parseInt(formData.stock) || 0;
      }

      // 🔧 CREAR EL PRODUCTO - Sin subir archivos

      const productResponse = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!productResponse.ok) {
        try {
          const error = await productResponse.json();
          console.error("❌ API Error:", error);
          throw new Error(error.message || "Error al crear el producto");
        } catch (jsonError) {
          console.error("❌ JSON Parse Error:", jsonError);
          throw new Error(
            `Error HTTP ${productResponse.status}: Error al crear el producto`
          );
        }
      }

      const result = await productResponse.json();

      toast.success("Producto creado exitosamente");
      router.push("/admin/products");
    } catch (error) {
      console.error("❌ Error creating product:", error);
      toast.error(error.message || "Error al crear el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si está cargando o no está autenticado, mostrar estado apropiado
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (
    status === "unauthenticated" ||
    (status === "authenticated" && session?.user?.role !== "admin")
  ) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-semibold mb-6">Agregar Nuevo Producto</h1>

      {/* Mensaje de campos obligatorios */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Por favor completa los campos obligatorios:
              </h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre del producto */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre del producto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                validationErrors.title ? "border-red-500" : "border-gray-300"
              }`}
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.title}
              </p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                validationErrors.category ? "border-red-500" : "border-gray-300"
              }`}
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
              <option value="ofertas">Ofertas</option>
              <option value="otros">Otros</option>
            </select>
            {validationErrors.category && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.category}
              </p>
            )}
          </div>
        </div>

        {/* Precio de venta (separado de información financiera) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="salePrice"
              className="block text-sm font-medium text-gray-700"
            >
              Precio de venta (ARS) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="salePrice"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                validationErrors.salePrice
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {validationErrors.salePrice && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.salePrice}
              </p>
            )}
          </div>

          {/* Stock (solo para productos sin variantes) */}
          {!showVariants && (
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700"
              >
                Stock
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  validationErrors.stock ? "border-red-500" : "border-gray-300"
                }`}
              />
              {validationErrors.stock && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.stock}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>

        {/* Sección de información financiera opcional (colapsable) */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowFinancialInfo(!showFinancialInfo)}
            className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
          >
            <span className="text-lg font-medium text-gray-800">
              Información financiera (opcional)
            </span>
            <svg
              className={`h-5 w-5 transform transition-transform ${
                showFinancialInfo ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showFinancialInfo && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Costo */}
                <div>
                  <label
                    htmlFor="cost"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Costo (ARS)
                  </label>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      validationErrors.cost
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Costo interno del producto (no visible para clientes)
                  </p>
                  {validationErrors.cost && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.cost}
                    </p>
                  )}
                </div>

                {/* Precio promocional */}
                <div>
                  <label
                    htmlFor="promoPrice"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Precio promocional (ARS)
                  </label>
                  <input
                    type="number"
                    id="promoPrice"
                    name="promoPrice"
                    value={formData.promoPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      validationErrors.promoPrice
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Precio de oferta (dejar vacío si no aplica)
                  </p>
                  {validationErrors.promoPrice && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.promoPrice}
                    </p>
                  )}
                </div>

                {/* Margen de ganancia */}
                <div className="md:col-span-2">
                  <div className="flex justify-between">
                    <label
                      htmlFor="profitMargin"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Margen de ganancia (%)
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
                    name="profitMargin"
                    value={formData.profitMargin}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    disabled={autoCalculateMargin}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      autoCalculateMargin ? "bg-gray-100" : ""
                    } ${
                      validationErrors.profitMargin
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {autoCalculateMargin
                      ? "Calculado como: (precio venta - costo) / precio venta * 100"
                      : "Ingrese el margen manualmente (0-100%)"}
                  </p>
                  {validationErrors.profitMargin && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.profitMargin}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Campos adicionales para productos de indumentaria */}
        {showExtraFields && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Detalles del producto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Género */}
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Género
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Seleccionar</option>
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Temporada */}
              <div>
                <label
                  htmlFor="season"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Temporada
                </label>
                <select
                  id="season"
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Seleccionar</option>
                  {seasonOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material */}
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
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  placeholder="Ej: Algodón, Poliéster, Lana..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Estilo */}
              <div>
                <label
                  htmlFor="style"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Estilo
                </label>
                <input
                  type="text"
                  id="style"
                  name="style"
                  value={formData.style}
                  onChange={handleChange}
                  placeholder="Ej: Casual, Formal, Deportivo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Campos específicos para pantalones */}
            {formData.category === "pantalones" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label
                    htmlFor="waistType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tipo de cintura
                  </label>
                  <select
                    id="waistType"
                    name="waistType"
                    value={formData.waistType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Seleccionar</option>
                    {waistTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="fit"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Corte
                  </label>
                  <select
                    id="fit"
                    name="fit"
                    value={formData.fit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Seleccionar</option>
                    {fitOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Campos específicos para calzado */}
            {formData.category === "calzado" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label
                    htmlFor="heelHeight"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Altura del tacón (cm)
                  </label>
                  <input
                    type="number"
                    id="heelHeight"
                    name="heelHeight"
                    value={formData.heelHeight}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="soleType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tipo de suela
                  </label>
                  <input
                    type="text"
                    id="soleType"
                    name="soleType"
                    value={formData.soleType}
                    onChange={handleChange}
                    placeholder="Ej: Goma, Cuero, Sintética..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sección de talle y color para productos con variantes */}
        {showVariants && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Opciones de talle y color
            </h3>

            {/* Sección de Talles */}
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">
                Talles disponibles
              </h4>

              {/* Añadir talles predefinidos */}
              <div className="flex flex-wrap gap-2 mb-3">
                {sizeOptions[formData.category]?.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`px-3 py-1 rounded-full text-xs ${
                      formData.sizes.includes(size)
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => handleAddPredefinedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* Input para añadir talles personalizados */}
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Añadir talle personalizado"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="ml-2 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <PlusCircleIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Lista de talles seleccionados */}
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.sizes.map((size) => (
                  <div
                    key={size}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center text-sm"
                  >
                    <span>{size}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(size)}
                      className="ml-1 text-indigo-500 hover:text-indigo-700"
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {validationErrors.sizes && (
                <p className="text-sm text-red-600">{validationErrors.sizes}</p>
              )}
            </div>

            {/* Sección de Colores */}
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">
                Colores disponibles
              </h4>

              {/* Añadir colores predefinidos */}
              <div className="flex flex-wrap gap-2 mb-3">
                {commonColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`px-3 py-1 rounded-full text-xs ${
                      formData.colors.includes(color)
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => handleAddPredefinedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>

              {/* Input para añadir colores personalizados */}
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Añadir color personalizado"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="ml-2 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <PlusCircleIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Lista de colores seleccionados */}
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.colors.map((color) => (
                  <div
                    key={color}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center text-sm"
                  >
                    <span>{color}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(color)}
                      className="ml-1 text-indigo-500 hover:text-indigo-700"
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {validationErrors.colors && (
                <p className="text-sm text-red-600">
                  {validationErrors.colors}
                </p>
              )}
            </div>

            {/* Tabla de Variantes */}
            {formData.variants.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-medium text-gray-700 mb-2">
                  Inventario por variante
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Talle
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Color
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.variants.map((variant, index) => (
                        <tr key={`${variant.size}-${variant.color}`}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {variant.size}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {variant.color}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) =>
                                handleVariantStockChange(index, e.target.value)
                              }
                              className="w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/*  SECCIÓN DE IMÁGENES */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes del producto <span className="text-red-500">*</span>
          </label>
          <div
            className={`${
              validationErrors.image ? "ring-2 ring-red-500 rounded-lg" : ""
            }`}
          >
            <MultipleImageUploader
              mainImage={mainImageUrl}
              additionalImages={additionalImages}
              onMainImageChange={handleMainImageChange}
              onAddImage={handleAddImage}
              onRemoveImage={handleRemoveImage}
              colors={formData.colors}
              forceSquareCrop={false}
              showCropPreview={true}
            />
          </div>
          {validationErrors.image && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.image}
            </p>
          )}
        </div>

        {/* Destacado */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label
            htmlFor="featured"
            className="ml-2 block text-sm text-gray-700"
          >
            Producto destacado (aparecerá en la página principal)
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {isSubmitting ? "Guardando..." : "Guardar Producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
