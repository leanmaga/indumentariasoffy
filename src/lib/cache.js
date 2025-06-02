// lib/cache.js - VERSIÓN MEJORADA CON CLEANUP AUTOMÁTICO
console.log("🎯 Inicializando cache solo en memoria (Redis desactivado)");

// Cache en memoria únicamente
const memoryCache = new Map();
const MEMORY_CACHE_MAX_SIZE = 1000;

// 🆕 CLEANUP AUTOMÁTICO CADA 5 MINUTOS
setInterval(() => {
  const now = Date.now();
  let deletedCount = 0;

  for (const [key, value] of memoryCache.entries()) {
    if (now >= value.expires) {
      memoryCache.delete(key);
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    console.log(
      `🧹 Cache cleanup: ${deletedCount} entradas expiradas eliminadas`
    );
  }
}, 5 * 60 * 1000); // 5 minutos

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

  // TTL para diferentes tipos de datos (en segundos)
  static ttl = {
    reviews: 10 * 60, // 10 minutos
    stats: 30 * 60, // 30 minutos
    permissions: 5 * 60, // 5 minutos
    topProducts: 60 * 60, // 1 hora
    globalStats: 60 * 60, // 1 hora
    dailyStats: 24 * 60 * 60, // 24 horas
    summary: 15 * 60, // 15 minutos
  };

  // Obtener datos del cache (solo memoria)
  static async get(key) {
    try {
      const cached = memoryCache.get(key);
      if (cached && Date.now() < cached.expires) {
        // 🆕 ACTUALIZAR ESTADÍSTICAS DE HIT
        this._updateStats("hit");
        return cached.data;
      } else if (cached) {
        memoryCache.delete(key);
        this._updateStats("expired");
      } else {
        this._updateStats("miss");
      }
      return null;
    } catch (error) {
      console.error("Error getting cache:", error.message);
      this._updateStats("error");
      return null;
    }
  }

  // Guardar datos en cache (solo memoria)
  static async set(key, data, ttl = 300) {
    try {
      // 🆕 VALIDAR DATOS ANTES DE GUARDAR
      if (data === null || data === undefined) {
        console.warn(
          `⚠️ Intentando cachear datos null/undefined para key: ${key}`
        );
        return;
      }

      // Limpiar cache si está lleno
      if (memoryCache.size >= MEMORY_CACHE_MAX_SIZE) {
        this._evictOldest();
      }

      memoryCache.set(key, {
        data,
        expires: Date.now() + ttl * 1000,
        createdAt: Date.now(), // 🆕 TIMESTAMP DE CREACIÓN
        accessCount: 0, // 🆕 CONTADOR DE ACCESOS
      });

      this._updateStats("set");
    } catch (error) {
      console.error("Error setting cache:", error.message);
      this._updateStats("error");
    }
  }

  // 🆕 MÉTODO MEJORADO PARA EVICT
  static _evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, value] of memoryCache.entries()) {
      if (value.createdAt < oldestTime) {
        oldestTime = value.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      memoryCache.delete(oldestKey);
      console.log(
        `🗑️ Cache eviction: eliminada clave más antigua ${oldestKey}`
      );
    }
  }

  // 🆕 ESTADÍSTICAS DE CACHE
  static stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    expired: 0,
    errors: 0,
    startTime: Date.now(),
  };

  static _updateStats(type) {
    this.stats[type] = (this.stats[type] || 0) + 1;
  }

  static getStats() {
    const runtime = Date.now() - this.stats.startTime;
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate =
      totalRequests > 0
        ? ((this.stats.hits / totalRequests) * 100).toFixed(2)
        : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      runtime: `${Math.round(runtime / 1000)}s`,
      cacheSize: memoryCache.size,
      maxSize: MEMORY_CACHE_MAX_SIZE,
    };
  }

  // Eliminar del cache
  static async del(key) {
    try {
      const existed = memoryCache.has(key);
      memoryCache.delete(key);
      if (existed) {
        console.log(`🗑️ Cache key deleted: ${key}`);
      }
    } catch (error) {
      console.error("Error deleting cache:", error.message);
    }
  }

  // Eliminar múltiples claves con patrón
  static async delPattern(pattern) {
    try {
      let deletedCount = 0;
      const searchPattern = pattern.replace("*", "");

      for (const key of memoryCache.keys()) {
        if (key.includes(searchPattern)) {
          memoryCache.delete(key);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(
          `🗑️ Pattern deletion: ${deletedCount} keys deleted for pattern: ${pattern}`
        );
      }
    } catch (error) {
      console.error("Error deleting pattern:", error.message);
    }
  }

  // Invalidar cache relacionado con un producto
  static async invalidateProduct(productId) {
    try {
      await Promise.all([
        this.del(this.keys.productReviews(productId)),
        this.del(this.keys.productStats(productId)),
        this.del(this.keys.reviewSummary(productId)),
        this.delPattern(`permissions:*:${productId}`),
        this.del(this.keys.topProducts),
        this.del(this.keys.globalStats),
      ]);
      console.log(`🔄 Product cache invalidated: ${productId}`);
    } catch (error) {
      console.error("Error invalidating product cache:", error.message);
    }
  }

  // Invalidar cache relacionado con un usuario
  static async invalidateUser(userId) {
    try {
      await this.delPattern(`permissions:${userId}:*`);
      console.log(`🔄 User cache invalidated: ${userId}`);
    } catch (error) {
      console.error("Error invalidating user cache:", error.message);
    }
  }

  // Limpiar estadísticas globales
  static async invalidateGlobalStats() {
    try {
      await Promise.all([
        this.del(this.keys.topProducts),
        this.del(this.keys.globalStats),
        this.delPattern("stats:daily:*"),
      ]);
      console.log("🔄 Global stats cache invalidated");
    } catch (error) {
      console.error("Error invalidating global stats:", error.message);
    }
  }

  // Verificar estado del cache
  static getStatus() {
    return {
      redis: "disabled",
      memoryCache: memoryCache.size,
      usingRedis: false,
      maxSize: MEMORY_CACHE_MAX_SIZE,
      stats: this.getStats(),
      // 🆕 INFORMACIÓN ADICIONAL
      memoryUsage: process.memoryUsage ? process.memoryUsage() : "N/A",
      oldestEntry: this._getOldestEntry(),
    };
  }

  // 🆕 OBTENER ENTRADA MÁS ANTIGUA
  static _getOldestEntry() {
    let oldestTime = Date.now();
    let oldestKey = null;

    for (const [key, value] of memoryCache.entries()) {
      if (value.createdAt < oldestTime) {
        oldestTime = value.createdAt;
        oldestKey = key;
      }
    }

    return oldestKey
      ? {
          key: oldestKey,
          age: Math.round((Date.now() - oldestTime) / 1000) + "s",
        }
      : null;
  }

  // Limpiar todo el cache
  static async clear() {
    const size = memoryCache.size;
    memoryCache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      expired: 0,
      errors: 0,
      startTime: Date.now(),
    };
    console.log(
      `🧹 Cache completamente limpiado (${size} entradas eliminadas)`
    );
  }

  // 🆕 MÉTODO PARA OBTENER TODAS LAS CLAVES
  static getAllKeys() {
    return Array.from(memoryCache.keys());
  }

  // 🆕 MÉTODO PARA OBTENER INFORMACIÓN DETALLADA
  static getDetailedInfo() {
    const entries = [];
    for (const [key, value] of memoryCache.entries()) {
      entries.push({
        key,
        size: JSON.stringify(value.data).length,
        createdAt: new Date(value.createdAt).toISOString(),
        expiresAt: new Date(value.expires).toISOString(),
        isExpired: Date.now() >= value.expires,
        accessCount: value.accessCount || 0,
      });
    }

    return {
      totalEntries: entries.length,
      totalSize: entries.reduce((sum, entry) => sum + entry.size, 0),
      entries: entries
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 20), // Solo las 20 más recientes
    };
  }
}

// Funciones específicas para reviews (sin cambios, pero con mejor logging)
export const ReviewCacheService = {
  // Resto de tus funciones exactamente igual...
  async getProductReviews(productId, useCache = true) {
    if (!useCache) return null;
    try {
      const key = ReviewCache.keys.productReviews(productId);
      return await ReviewCache.get(key);
    } catch (error) {
      console.error("Error in getProductReviews:", error.message);
      return null;
    }
  },

  async setProductReviews(productId, data) {
    try {
      const key = ReviewCache.keys.productReviews(productId);
      await ReviewCache.set(key, data, ReviewCache.ttl.reviews);
    } catch (error) {
      console.error("Error in setProductReviews:", error.message);
    }
  },

  async getProductStats(productId) {
    try {
      const key = ReviewCache.keys.productStats(productId);
      return await ReviewCache.get(key);
    } catch (error) {
      console.error("Error in getProductStats:", error.message);
      return null;
    }
  },

  async setProductStats(productId, stats) {
    try {
      const key = ReviewCache.keys.productStats(productId);
      await ReviewCache.set(key, stats, ReviewCache.ttl.stats);
    } catch (error) {
      console.error("Error in setProductStats:", error.message);
    }
  },

  async getUserPermissions(userId, productId) {
    try {
      const key = ReviewCache.keys.userPermissions(userId, productId);
      return await ReviewCache.get(key);
    } catch (error) {
      console.error("Error in getUserPermissions:", error.message);
      return null;
    }
  },

  async setUserPermissions(userId, productId, permissions) {
    try {
      const key = ReviewCache.keys.userPermissions(userId, productId);
      await ReviewCache.set(key, permissions, ReviewCache.ttl.permissions);
    } catch (error) {
      console.error("Error in setUserPermissions:", error.message);
    }
  },

  async getReviewSummary(productId) {
    try {
      const key = ReviewCache.keys.reviewSummary(productId);
      return await ReviewCache.get(key);
    } catch (error) {
      console.error("Error in getReviewSummary:", error.message);
      return null;
    }
  },

  async setReviewSummary(productId, summary) {
    try {
      const key = ReviewCache.keys.reviewSummary(productId);
      await ReviewCache.set(key, summary, ReviewCache.ttl.summary);
    } catch (error) {
      console.error("Error in setReviewSummary:", error.message);
    }
  },

  async invalidateOnReviewChange(productId, userId) {
    try {
      await Promise.all([
        ReviewCache.invalidateProduct(productId),
        ReviewCache.invalidateUser(userId),
        ReviewCache.invalidateGlobalStats(),
      ]);
    } catch (error) {
      console.error("Error in invalidateOnReviewChange:", error.message);
    }
  },

  getStatus() {
    return ReviewCache.getStatus();
  },
};

// 🆕 FUNCIÓN PARA DEBUGGING MEJORADA
export const debugCache = () => {
  const status = ReviewCache.getStatus();
  const detailed = ReviewCache.getDetailedInfo();

  console.log("🔍 Estado del cache:", status);
  console.log("📊 Estadísticas detalladas:", detailed);

  return { status, detailed };
};

// 🆕 ENDPOINT PARA MONITOREO (crear en /api/admin/cache-status)
export const getCacheStatusForAPI = () => {
  return {
    success: true,
    cache: ReviewCache.getStatus(),
    detailed: ReviewCache.getDetailedInfo(),
    performance: ReviewCache.getStats(),
  };
};

console.log("✅ Cache solo en memoria inicializado correctamente");

export default ReviewCache;
