"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { XCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function AddProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "ropa", // Valor por defecto
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
  }, [formData.category]);

  // Efecto para autogenerar variantes cuando cambian talles o colores
  useEffect(() => {
    if (
      showVariants &&
      formData.sizes.length > 0 &&
      formData.colors.length > 0
    ) {
      // Crear todas las combinaciones posibles de talle y color
      const newVariants = [];
      formData.sizes.forEach((size) => {
        formData.colors.forEach((color) => {
          // Verificar si la variante ya existe
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
  }, [formData.sizes, formData.colors, showVariants]);

  // Usar useEffect para la redirección
  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && session?.user?.role !== "admin")
    ) {
      router.push("/auth/signin?callbackUrl=/admin");
    }
  }, [status, session, router]);

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
    return null; // No renderizar nada mientras se redirige
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar campos requeridos
      if (
        !formData.title ||
        !formData.price ||
        !formData.category ||
        !imageFile
      ) {
        throw new Error(
          "Por favor complete todos los campos requeridos e incluya una imagen"
        );
      }

      // Validar que el precio sea un número positivo
      if (
        isNaN(parseFloat(formData.price)) ||
        parseFloat(formData.price) <= 0
      ) {
        throw new Error("El precio debe ser un número positivo");
      }

      // Validar stock según la categoría
      if (!showVariants) {
        if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
          throw new Error("El stock debe ser un número no negativo");
        }
      } else {
        // Para productos con variantes, validar que haya al menos un talle y un color
        if (formData.sizes.length === 0) {
          throw new Error("Debe agregar al menos un talle");
        }

        if (formData.colors.length === 0) {
          throw new Error("Debe agregar al menos un color");
        }

        // Verificar que el stock total no sea cero
        const totalStock = formData.variants.reduce(
          (sum, variant) => sum + variant.stock,
          0
        );
        if (totalStock === 0) {
          throw new Error("Debe tener al menos una unidad en stock");
        }
      }

      // Subir la imagen utilizando nuestra API
      const imageData = new FormData();
      imageData.append("file", imageFile);

      const imageUploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: imageData,
      });

      if (!imageUploadResponse.ok) {
        const errorData = await imageUploadResponse.json();
        throw new Error(errorData.error || "Error al subir la imagen");
      }

      const imageResult = await imageUploadResponse.json();
      const imageUrl = imageResult.imageUrl;

      // Preparar los datos del producto
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        imageUrl,
      };

      // Para productos sin variantes, incluir el stock total
      if (!showVariants) {
        productData.stock = parseInt(formData.stock);
      } else {
        // Para productos con variantes, calcular el stock total
        productData.stock = formData.variants.reduce(
          (sum, variant) => sum + variant.stock,
          0
        );
      }

      // Crear el producto
      const productResponse = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!productResponse.ok) {
        const error = await productResponse.json();
        throw new Error(error.message || "Error al crear el producto");
      }

      toast.success("Producto creado exitosamente");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error al crear producto:", error);
      toast.error(error.message || "Error al crear el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-semibold mb-6">Agregar Nuevo Producto</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre del producto */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre del producto *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Precio */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Precio (ARS) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Categoría *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
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
          </div>

          {/* Stock (solo para productos sin variantes) */}
          {!showVariants && (
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700"
              >
                Stock *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
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

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Imagen del producto *
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              required
            />
          </div>
          {imagePreview && (
            <div className="mt-2">
              <Image
                src={imagePreview}
                alt="Vista previa"
                className="h-40 w-auto object-contain border rounded-md"
              />
            </div>
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
