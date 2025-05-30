// src/lib/mercadopago.js
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import connectDB from "./db";
import MercadoPagoConfigModel from "@/models/MercadoPagoConfig";

// Cache para el cliente de MercadoPago
let cachedClient = null;
let cacheExpiry = null;

// Obtener el cliente de MercadoPago con credenciales dinámicas - ACTUALIZADA
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
        console.warn("Token de MercadoPago expirado, necesita renovación");
        // Lanzar error en lugar de continuar con fallback
        throw new Error(
          "Token de MercadoPago expirado. Por favor, vuelve a conectar tu cuenta desde el panel de administración."
        );
      }

      const accessToken = config.getDecryptedAccessToken();

      if (accessToken) {
        console.log("Usando credenciales de producción de la base de datos");
        cachedClient = new MercadoPagoConfig({
          accessToken: accessToken,
          options: {
            timeout: 5000,
            idempotencyKey: "abc", // Opcional
          },
        });

        // Cache por 5 minutos
        cacheExpiry = new Date(Date.now() + 5 * 60 * 1000);

        return cachedClient;
      }
    }

    // Fallback a variables de entorno SOLO para desarrollo/testing
    // NOTA: Esto ya no se considera como "configurado" en checkMercadoPagoStatus
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error(
        "No se encontraron credenciales de MercadoPago. Por favor, conecta tu cuenta desde el panel de administración."
      );
    }

    console.warn(
      "Usando credenciales de variables de entorno (solo para desarrollo/testing)"
    );

    cachedClient = new MercadoPagoConfig({
      accessToken: accessToken,
    });

    // Cache por 5 minutos
    cacheExpiry = new Date(Date.now() + 5 * 60 * 1000);

    return cachedClient;
  } catch (error) {
    console.error("Error al obtener cliente de MercadoPago:", error);
    throw error;
  }
};

// Crear preferencia de pago
export const createPaymentPreference = async (orderData) => {
  try {
    const client = await getClient();

    // Verificar que orderData tenga los campos requeridos
    if (!orderData.items || !orderData.items.length || !orderData._id) {
      throw new Error("Datos de orden inválidos: faltan campos requeridos");
    }

    // Preparar items para MercadoPago
    const items = orderData.items.map((item) => ({
      id: item.product.toString(),
      title: item.title,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: "ARS",
      picture_url: item.imageUrl,
    }));

    // Obtener URL base con fallback
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      "http://localhost:3000";

    // URLs de retorno
    const backUrls = {
      success: `${baseUrl}/checkout/success?orderId=${orderData._id}`,
      failure: `${baseUrl}/checkout/failure?orderId=${orderData._id}`,
      pending: `${baseUrl}/checkout/pending?orderId=${orderData._id}`,
    };

    // Crear preferencia
    const preferenceData = {
      items: items,
      back_urls: backUrls,
      auto_return: "approved", // Puedes habilitarlo ahora que tienes URLs correctas
      external_reference: orderData._id.toString(),
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      payer: {
        name: orderData.shippingInfo.name,
        email: orderData.shippingInfo.email,
        phone: {
          number: orderData.shippingInfo.phone,
        },
        address: {
          street_name: orderData.shippingInfo.address,
          zip_code: orderData.shippingInfo.postalCode,
        },
      },
      payment_methods: {
        excluded_payment_types: [
          {
            id: "ticket", // Excluir pagos en efectivo si lo deseas
          },
        ],
        installments: 12, // Máximo de cuotas
      },
      statement_descriptor: "IndumentariaSoffy",
      expires: true,
      expiration_date_to: new Date(
        Date.now() + 1000 * 60 * 60 * 24
      ).toISOString(), // 24 horas
      binary_mode: false,
    };

    const preference = new Preference(client);
    const response = await preference.create({ body: preferenceData });

    return response;
  } catch (error) {
    console.error("Error al crear preferencia en MercadoPago:", error);
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

// Buscar pagos por referencia externa
export const getPaymentsByExternalReference = async (externalReference) => {
  try {
    const client = await getClient();
    const payment = new Payment(client);

    const searchResult = await payment.search({
      options: {
        external_reference: externalReference,
      },
    });

    return searchResult.results || [];
  } catch (error) {
    console.error("Error al buscar pagos por referencia externa:", error);
    throw new Error(`Error al buscar pagos: ${error.message}`);
  }
};

// Función para verificar si las credenciales están configuradas
export const checkMercadoPagoStatus = async () => {
  try {
    await connectDB();
    const config = await MercadoPagoConfigModel.getActiveConfig();

    // Solo considerar configurado si hay una configuración activa en la base de datos
    if (!config) {
      return {
        isConfigured: false, // Cambio principal: siempre false si no hay config en DB
        isProduction: false,
        source: "none",
      };
    }

    // Verificar si el token no ha expirado
    const isExpired = config.expiresAt && new Date() > config.expiresAt;

    return {
      isConfigured: !isExpired, // Solo configurado si no ha expirado
      isProduction: config.isProduction,
      expiresAt: config.expiresAt,
      source: "database",
      isExpired: isExpired,
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
