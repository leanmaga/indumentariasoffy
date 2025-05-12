import connectDB from "./db";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";

// Función para obtener productos destacados
export async function getFeaturedProducts() {
  try {
    await connectDB();
    const featuredProducts = await Product.find({ featured: true }).limit(8);
    return JSON.parse(JSON.stringify(featuredProducts));
  } catch (error) {
    console.error("Error al obtener productos destacados:", error);
    return [];
  }
}

// Función para obtener todos los productos con filtros opcionales
export async function getProducts(options = {}) {
  try {
    await connectDB();

    const {
      category,
      sort = "createdAt",
      order = -1,
      limit = 100,
      page = 1,
    } = options;

    const skip = (page - 1) * parseInt(limit);
    const sortOptions = { [sort]: order };

    let query = {};

    if (category && category !== "all") {
      query.category = category;
    }

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    return {
      products: JSON.parse(JSON.stringify(products)),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return { products: [], pagination: { total: 0, page: 1, pages: 0 } };
  }
}

// Función para obtener un producto por ID
export async function getProductById(id) {
  try {
    await connectDB();
    const product = await Product.findById(id);

    if (!product) {
      return null;
    }

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    return null;
  }
}

// Función para obtener una orden por ID
export async function getOrderById(id) {
  try {
    await connectDB();
    const order = await Order.findById(id);

    if (!order) {
      return null;
    }

    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    console.error("Error al obtener orden por ID:", error);
    return null;
  }
}

// Función para obtener órdenes de un usuario
export async function getUserOrders(userId) {
  try {
    await connectDB();
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error("Error al obtener órdenes del usuario:", error);
    return [];
  }
}

// Función para obtener todas las órdenes (para admin)
export async function getAllOrders() {
  try {
    await connectDB();
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error("Error al obtener todas las órdenes:", error);
    return [];
  }
}

// Función para obtener todos los usuarios (para admin)
export async function getAllUsers() {
  try {
    await connectDB();
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
}

// Obtener productos relacionados por categoría y excluyendo el producto actual
export async function getRelatedProducts(
  category,
  currentProductId,
  limit = 3
) {
  await connectDB();

  try {
    // Buscar productos de la misma categoría, excluyendo el actual
    const relatedProducts = await Product.find({
      category: category,
      _id: { $ne: currentProductId },
      stock: { $gt: 0 }, // Solo productos con stock
    })
      .sort({ featured: -1 }) // Priorizar productos destacados
      .limit(limit);

    return JSON.parse(JSON.stringify(relatedProducts));
  } catch (error) {
    console.error("Error al obtener productos relacionados:", error);
    return [];
  }
}
