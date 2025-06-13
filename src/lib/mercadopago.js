// src/lib/mercadopago.js - CON CONFIGURACIÓN AUTOMÁTICA
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import connectDB from "./db";
import MercadoPagoConfigModel from "@/models/MercadoPagoConfig";
import { getMercadoPagoConfig } from "./config";

// Cache para el cliente de MercadoPago
let cachedClient = null;
let cacheExpiry = null;

// Obtener el cliente de MercadoPago con configuración automática
const getClient = async () => {
  // Verificar si tenemos un cliente en caché válido
  if (cachedClient && cacheExpiry && new Date() < cacheExpiry) {
    return cachedClient;
  }

  try {
    // Primero intentar obtener credenciales de la base de datos
    await connectDB();
    const config = await MercadoPagoConfigModel.getActiveConfig();

    if (config && config.accessToken) {
      // Verificar si el token no ha expirado
      if (config.expiresAt && new Date() > config.expiresAt) {
        console.warn(
          "Token de MercadoPago expirado, usando configuración automática"
        );
      } else {
        const accessToken = config.getDecryptedAccessToken();

        if (accessToken) {
          cachedClient = new MercadoPagoConfig({
            accessToken: accessToken,
            options: {
              timeout: 5000,
            },
          });

          cacheExpiry = new Date(Date.now() + 5 * 60 * 1000);
          return cachedClient;
        }
      }
    }

    // Fallback a configuración automática por ambiente
    const mpConfig = getMercadoPagoConfig();

    if (!mpConfig.accessToken) {
      throw new Error(
        "No se encontraron credenciales de MercadoPago. Configura las variables de entorno necesarias."
      );
    }

    if (
      mpConfig.environment === "production" &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn("⚠️ ATENCIÓN: Credenciales de PRODUCCIÓN en desarrollo!");
      console.warn(
        "⚠️ Los pagos serán REALES. Para testing seguro, obtén credenciales de sandbox."
      );
    }

    cachedClient = new MercadoPagoConfig({
      accessToken: mpConfig.accessToken,
      options: {
        timeout: 5000,
      },
    });

    cacheExpiry = new Date(Date.now() + 5 * 60 * 1000);
    return cachedClient;
  } catch (error) {
    console.error("❌ Error al obtener cliente de MercadoPago:", error);
    throw error;
  }
};

// Crear preferencia de pago - FUNCIÓN OPTIMIZADA
export const createPaymentPreference = async (orderData) => {
  try {
    const client = await getClient();
    const mpConfig = getMercadoPagoConfig();

    // Verificar que orderData tenga los campos requeridos
    if (!orderData.items || !orderData.items.length || !orderData._id) {
      throw new Error("Datos de orden inválidos: faltan campos requeridos");
    }

    // Preparar items para MercadoPago
    const items = orderData.items.map((item) => ({
      id: item.product?.toString() || "unknown",
      title: item.title || "Producto",
      quantity: parseInt(item.quantity) || 1,
      unit_price: parseFloat(item.price) || 0,
      currency_id: "ARS",
      picture_url: item.imageUrl || "",
      description: `${item.title} - Cantidad: ${item.quantity}`,
    }));

    // Obtener URL base
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const backUrls = {
      success: `${cleanBaseUrl}/checkout/success?payment_status=approved&external_reference=${orderData._id}`,
      failure: `${cleanBaseUrl}/checkout/failure?payment_status=rejected&external_reference=${orderData._id}`,
      pending: `${cleanBaseUrl}/checkout/pending?payment_status=pending&external_reference=${orderData._id}`,
    };

    // Preparar datos del pagador
    const payerData = {
      name: orderData.shippingInfo?.name || "Cliente",
      email: orderData.shippingInfo?.email || "cliente@email.com",
    };

    // Solo agregar teléfono si está disponible y es válido
    if (orderData.shippingInfo?.phone) {
      const cleanPhone = orderData.shippingInfo.phone.replace(/\D/g, "");
      if (cleanPhone.length >= 8) {
        payerData.phone = {
          area_code: "11",
          number: cleanPhone.substring(cleanPhone.length - 8),
        };
      }
    }

    // Solo agregar dirección si está completa
    if (orderData.shippingInfo?.address && orderData.shippingInfo?.postalCode) {
      payerData.address = {
        street_name: orderData.shippingInfo.address,
        zip_code: orderData.shippingInfo.postalCode,
      };
    }

    // Crear preferencia
    const preferenceData = {
      items: items,
      back_urls: backUrls,
      external_reference: orderData._id.toString(),
      notification_url: `${baseUrl}/api/mercadopago/webhook`,

      payer: payerData,

      payment_methods: {
        installments: 12,
        default_installments: 1,
      },

      metadata: {
        order_id: orderData._id.toString(),
        customer_email: orderData.shippingInfo?.email || "unknown",
        environment: mpConfig.environment,
      },

      statement_descriptor: "IndumentariaSoffy",
      expires: true,
      expiration_date_to: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),
      binary_mode: false,
    };

    // console.log("📝 Datos de preferencia preparados:", {
    //   items: items.length,
    //   total: items.reduce(
    //     (sum, item) => sum + item.unit_price * item.quantity,
    //     0
    //   ),
    //   external_reference: preferenceData.external_reference,
    //   payer_email: preferenceData.payer.email,
    //   environment: mpConfig.environment,
    // });

    const preference = new Preference(client);
    const response = await preference.create({ body: preferenceData });

    // Validar respuesta
    if (!response.id) {
      throw new Error("MercadoPago no devolvió un ID de preferencia válido");
    }

    if (!response.init_point && !response.sandbox_init_point) {
      throw new Error("MercadoPago no devolvió URLs de checkout válidas");
    }

    return response;
  } catch (error) {
    console.error("❌ Error detallado al crear preferencia:", {
      message: error.message,
      response: error.response?.data || "No response data",
      status: error.response?.status || "No status",
      orderData: {
        id: orderData._id,
        itemsCount: orderData.items?.length,
        total: orderData.totalAmount,
      },
    });

    throw new Error(
      `Error al crear preferencia en MercadoPago: ${error.message}`
    );
  }
};

// Verificar estado de un pago
export const getPaymentStatus = async (paymentId) => {
  try {
    const client = await getClient();
    const payment = new Payment(client);
    const response = await payment.get({ id: paymentId });
    return response;
  } catch (error) {
    console.error("Error al verificar el estado del pago:", error);
    throw new Error(`Error al verificar el estado del pago: ${error.message}`);
  }
};

// Función para verificar configuración
export const checkMercadoPagoStatus = async () => {
  try {
    await connectDB();
    const config = await MercadoPagoConfigModel.getActiveConfig();
    const mpConfig = getMercadoPagoConfig();

    // Verificar si hay configuración en base de datos
    if (config && config.accessToken) {
      const isExpired = config.expiresAt && new Date() > config.expiresAt;

      return {
        isConfigured: !isExpired,
        isProduction: config.isProduction,
        expiresAt: config.expiresAt,
        source: "database",
        isExpired: isExpired,
      };
    }

    // Verificar configuración automática
    return {
      isConfigured: !!mpConfig.accessToken,
      isProduction: mpConfig.environment === "production",
      source: "environment",
      environment: mpConfig.environment,
      canUseTestCards: mpConfig.canUseTestCards,
    };
  } catch (error) {
    console.error("Error al verificar estado de MercadoPago:", error);
    return {
      isConfigured: false,
      isProduction: false,
      source: "none",
    };
  }
};

// Función para obtener pago por ID
export async function getPaymentById(paymentId) {
  try {
    const client = await getClient();
    const payment = new Payment(client);
    const response = await payment.get({ id: paymentId });

    return response;
  } catch (error) {
    console.error(`❌ Error obteniendo pago ${paymentId}:`, error);
    throw error;
  }
}

// Función para buscar pagos por external_reference
export async function getPaymentsByExternalReference(externalReference) {
  try {
    const mpConfig = getMercadoPagoConfig();
    const accessToken = mpConfig.accessToken;

    if (!accessToken) {
      throw new Error("Access token no configurado");
    }

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${externalReference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Error response from MercadoPago:", errorData);
      throw new Error(
        `Error ${response.status}: ${
          errorData.message || "Error buscando pagos"
        }`
      );
    }

    const data = await response.json();

    return data.results || [];
  } catch (error) {
    console.error(`❌ Error buscando pagos para ${externalReference}:`, error);
    throw error;
  }
}
