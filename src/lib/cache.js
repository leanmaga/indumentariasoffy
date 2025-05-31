// lib/cache.js - Sistema de cache para reviews
import { Redis } from "ioredis";

// Configuración de Redis (si está disponible)
let redis = null;
try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL);
  }
} catch (error) {
  console.warn("Redis no disponible, usando cache en memoria");
}

// Cache en memoria como fallback
const memoryCache = new Map();
const MEMORY_CACHE_MAX_SIZE = 1000;
const MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

class ReviewCache {
  // Claves de cache organizadas
  static keys = {
    productReviews: (productId) => `reviews:product:${productId}`,
    productStats: (productId) => `stats:product:${productId}`,
    userPermissions: (userId, productId) =>
      `permissions:${userId}:${productId}`,
    topProducts: "reviews:top_products",
    globalStats: "reviews:global_stats",
    dailyStats: (date) => `stats:daily:${date}`,
    reviewSummary: (productId) => `summary:${productId}`,
  };

  // TTL para diferentes tipos de datos
  static ttl = {
    reviews: 10 * 60, // 10 minutos
    stats: 30 * 60, // 30 minutos
    permissions: 5 * 60, // 5 minutos
    topProducts: 60 * 60, // 1 hora
    globalStats: 60 * 60, // 1 hora
    dailyStats: 24 * 60 * 60, // 24 horas
    summary: 15 * 60, // 15 minutos
  };

  // Obtener datos del cache
  static async get(key) {
    try {
      if (redis) {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Fallback a memoria
        const cached = memoryCache.get(key);
        if (cached && Date.now() < cached.expires) {
          return cached.data;
        } else if (cached) {
          memoryCache.delete(key);
        }
        return null;
      }
    } catch (error) {
      console.error("Error getting cache:", error);
      return null;
    }
  }

  // Guardar datos en cache
  static async set(key, data, ttl = 300) {
    try {
      if (redis) {
        await redis.setex(key, ttl, JSON.stringify(data));
      } else {
        // Fallback a memoria
        // Limpiar cache si está lleno
        if (memoryCache.size >= MEMORY_CACHE_MAX_SIZE) {
          const firstKey = memoryCache.keys().next().value;
          memoryCache.delete(firstKey);
        }

        memoryCache.set(key, {
          data,
          expires: Date.now() + ttl * 1000,
        });
      }
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  }

  // Eliminar del cache
  static async del(key) {
    try {
      if (redis) {
        await redis.del(key);
      } else {
        memoryCache.delete(key);
      }
    } catch (error) {
      console.error("Error deleting cache:", error);
    }
  }

  // Eliminar múltiples claves con patrón
  static async delPattern(pattern) {
    try {
      if (redis) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        // Para memoria, iterar y eliminar
        for (const key of memoryCache.keys()) {
          if (key.includes(pattern.replace("*", ""))) {
            memoryCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting pattern:", error);
    }
  }

  // Invalidar cache relacionado con un producto
  static async invalidateProduct(productId) {
    await Promise.all([
      this.del(this.keys.productReviews(productId)),
      this.del(this.keys.productStats(productId)),
      this.del(this.keys.reviewSummary(productId)),
      this.delPattern(`permissions:*:${productId}`),
      this.del(this.keys.topProducts),
      this.del(this.keys.globalStats),
    ]);
  }

  // Invalidar cache relacionado con un usuario
  static async invalidateUser(userId) {
    await this.delPattern(`permissions:${userId}:*`);
  }

  // Limpiar estadísticas globales
  static async invalidateGlobalStats() {
    await Promise.all([
      this.del(this.keys.topProducts),
      this.del(this.keys.globalStats),
      this.delPattern("stats:daily:*"),
    ]);
  }
}

// Middleware para cache automático en APIs
export const withCache = (handler, cacheKey, ttl = 300) => {
  return async (req, res) => {
    // Solo cachear GET requests
    if (req.method !== "GET") {
      return handler(req, res);
    }

    try {
      // Generar clave de cache dinámica
      const key = typeof cacheKey === "function" ? cacheKey(req) : cacheKey;

      // Intentar obtener del cache
      const cached = await ReviewCache.get(key);
      if (cached) {
        console.log(`Cache hit: ${key}`);
        return res.status(200).json(cached);
      }

      // Interceptar la respuesta para cachear
      const originalJson = res.json;
      res.json = function (data) {
        // Solo cachear respuestas exitosas
        if (res.statusCode === 200 && data.success) {
          ReviewCache.set(key, data, ttl);
          console.log(`Cache set: ${key}`);
        }
        return originalJson.call(this, data);
      };

      return handler(req, res);
    } catch (error) {
      console.error("Cache middleware error:", error);
      return handler(req, res);
    }
  };
};

// Funciones específicas para reviews
export const ReviewCacheService = {
  // Obtener reviews de un producto con cache
  async getProductReviews(productId, useCache = true) {
    if (!useCache) return null;

    const key = ReviewCache.keys.productReviews(productId);
    return await ReviewCache.get(key);
  },

  // Guardar reviews en cache
  async setProductReviews(productId, data) {
    const key = ReviewCache.keys.productReviews(productId);
    await ReviewCache.set(key, data, ReviewCache.ttl.reviews);
  },

  // Obtener estadísticas de producto
  async getProductStats(productId) {
    const key = ReviewCache.keys.productStats(productId);
    return await ReviewCache.get(key);
  },

  // Guardar estadísticas de producto
  async setProductStats(productId, stats) {
    const key = ReviewCache.keys.productStats(productId);
    await ReviewCache.set(key, stats, ReviewCache.ttl.stats);
  },

  // Obtener permisos de usuario
  async getUserPermissions(userId, productId) {
    const key = ReviewCache.keys.userPermissions(userId, productId);
    return await ReviewCache.get(key);
  },

  // Guardar permisos de usuario
  async setUserPermissions(userId, productId, permissions) {
    const key = ReviewCache.keys.userPermissions(userId, productId);
    await ReviewCache.set(key, permissions, ReviewCache.ttl.permissions);
  },

  // Obtener resumen de reviews para widget
  async getReviewSummary(productId) {
    const key = ReviewCache.keys.reviewSummary(productId);
    return await ReviewCache.get(key);
  },

  // Guardar resumen de reviews
  async setReviewSummary(productId, summary) {
    const key = ReviewCache.keys.reviewSummary(productId);
    await ReviewCache.set(key, summary, ReviewCache.ttl.summary);
  },

  // Invalidar cuando se crea/modifica una review
  async invalidateOnReviewChange(productId, userId) {
    await Promise.all([
      ReviewCache.invalidateProduct(productId),
      ReviewCache.invalidateUser(userId),
      ReviewCache.invalidateGlobalStats(),
    ]);
  },
};

// Hook para precargar datos en paralelo
export const useReviewPreloader = () => {
  const preloadProductData = async (productId) => {
    try {
      // Ejecutar todas las consultas en paralelo
      const [reviewsRes, permissionsRes, summaryRes] = await Promise.all([
        fetch(`/api/products/${productId}/reviews?preload=true`),
        fetch(`/api/products/${productId}/reviews/can-review`),
        fetch(`/api/products/${productId}/reviews/summary`),
      ]);

      const [reviews, permissions, summary] = await Promise.all([
        reviewsRes.json(),
        permissionsRes.json(),
        summaryRes.json(),
      ]);

      return { reviews, permissions, summary };
    } catch (error) {
      console.error("Error preloading review data:", error);
      return null;
    }
  };

  return { preloadProductData };
};

// Utilidad para paginación optimizada
export const optimizedPagination = {
  // Calcular offset de manera eficiente
  getOffset: (page, limit) => (page - 1) * limit,

  // Generar clave de cache para paginación
  getCacheKey: (base, page, limit, filters = {}) => {
    const filterStr = Object.keys(filters)
      .sort()
      .map((key) => `${key}:${filters[key]}`)
      .join("|");
    return `${base}:p${page}:l${limit}:f${filterStr}`;
  },

  // Generar pipeline de agregación optimizado
  getAggregationPipeline: (filters, sort, skip, limit) => {
    const pipeline = [];

    // Match stage
    if (Object.keys(filters).length > 0) {
      pipeline.push({ $match: filters });
    }

    // Sort stage
    pipeline.push({ $sort: sort });

    // Facet para obtener datos y count en una sola consulta
    pipeline.push({
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
              pipeline: [{ $project: { name: 1 } }],
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        ],
        totalCount: [{ $count: "count" }],
      },
    });

    return pipeline;
  },
};

// Middleware para rate limiting
export const rateLimitMiddleware = (
  maxRequests = 100,
  windowMs = 15 * 60 * 1000
) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpiar requests antiguos
    for (const [key, timestamps] of requests.entries()) {
      const filtered = timestamps.filter((time) => time > windowStart);
      if (filtered.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, filtered);
      }
    }

    // Verificar limite para esta IP
    const userRequests = requests.get(ip) || [];
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    // Agregar esta request
    userRequests.push(now);
    requests.set(ip, userRequests);

    next();
  };
};

// Función para warming del cache
export const warmCache = async () => {
  try {
    console.log("🔥 Iniciando warming del cache...");

    // Obtener productos más populares
    const topProducts = await fetch(
      "/api/products?featured=true&limit=20"
    ).then((res) => res.json());

    // Precargar reviews de productos populares
    const promises =
      topProducts.products?.map(async (product) => {
        try {
          await fetch(`/api/products/${product._id}/reviews`);
          await fetch(`/api/products/${product._id}/reviews/summary`);
          console.log(`✅ Cache precargado para: ${product.title}`);
        } catch (error) {
          console.error(`❌ Error precargando ${product._id}:`, error);
        }
      }) || [];

    await Promise.all(promises);
    console.log("🎉 Cache warming completado");
  } catch (error) {
    console.error("❌ Error en cache warming:", error);
  }
};

export default ReviewCache;
