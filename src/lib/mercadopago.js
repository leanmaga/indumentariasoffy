// mercadopago.js - Actualización para corregir errores de auto_return

import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

// Configurar MercadoPago con token de acceso
const getClient = () => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN no está configurado en variables de entorno"
    );
  }

  return new MercadoPagoConfig({
    accessToken: accessToken,
  });
};

// Crear preferencia de pago
export const createPaymentPreference = async (orderData) => {
  try {
    const client = getClient();

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
      currency_id: "ARS", // Argentina
      picture_url: item.imageUrl,
    }));

    // Obtener URL base con fallback
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000";

    // CORRECIÓN: Definir correctamente las URLs de retorno
    const backUrls = {
      success: `${baseUrl}/checkout/success?orderId=${orderData._id}`,
      failure: `${baseUrl}/checkout/failure?orderId=${orderData._id}`,
      pending: `${baseUrl}/checkout/pending?orderId=${orderData._id}`,
    };

    console.log("URLs de retorno configuradas:", backUrls);

    // Crear preferencia con formato correcto para v2
    const preferenceData = {
      items: items,
      back_urls: backUrls, // Asegúrate de que estén bien formadas
      external_reference: orderData._id.toString(),
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      // ELIMINAMOS auto_return ya que causa problemas
      // Si quieres habilitarlo, asegúrate de que back_urls.success exista
      // auto_return: "approved",
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
      statement_descriptor: "Mi Tienda Online",
      // Configuraciones adicionales para mejorar la integración
      expires: true,
      expiration_date_to: new Date(
        Date.now() + 1000 * 60 * 60 * 24
      ).toISOString(), // 24 horas
      binary_mode: false, // Permitir estado "pendiente"
    };

    console.log(
      "Creando preferencia MercadoPago:",
      JSON.stringify(preferenceData, null, 2)
    );

    const preference = new Preference(client);
    const response = await preference.create({ body: preferenceData });

    console.log("Preferencia creada:", JSON.stringify(response, null, 2));

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
    const client = getClient();
    const payment = new Payment(client);
    const response = await payment.get({ id: paymentId });
    return response;
  } catch (error) {
    console.error("Error al verificar el estado del pago:", error);
    throw new Error(`Error al verificar el estado del pago: ${error.message}`);
  }
};

// Buscar pagos por referencia externa (ID de la orden)
export const getPaymentsByExternalReference = async (externalReference) => {
  try {
    const client = getClient();
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
