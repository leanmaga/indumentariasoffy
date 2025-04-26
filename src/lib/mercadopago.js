// Importación para SDK v2
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

// Configurar MercadoPago con el token de acceso
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

// Crear una preferencia de pago
export const createPaymentPreference = async (orderData) => {
  try {
    // Verificar que tengamos un token de acceso configurado
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error(
        "MERCADOPAGO_ACCESS_TOKEN no está configurado en variables de entorno"
      );
    }

    // Preparar los items para MercadoPago
    const items = orderData.items.map((item) => ({
      id: item.product.toString(),
      title: item.title,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: "ARS", // Argentina
      picture_url: item.imageUrl,
    }));

    // Crear la preferencia con el formato correcto para v2
    const preferenceData = {
      items: items,
      // URLs planas en lugar de objeto anidado
      back_urls: {
        success: `${process.env.NEXTAUTH_URL}/checkout/success`,
        failure: `${process.env.NEXTAUTH_URL}/checkout/failure`,
        pending: `${process.env.NEXTAUTH_URL}/checkout/pending`,
      },
      // Eliminamos auto_return que está causando problemas
      external_reference: orderData._id.toString(),
      notification_url: `${process.env.NEXTAUTH_URL}/api/mercadopago/webhook`,
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
    };

    console.log("Creando preferencia de MercadoPago:", preferenceData);

    const preference = new Preference(client);
    const response = await preference.create({ body: preferenceData });

    console.log("Preferencia creada:", response);

    return response;
  } catch (error) {
    console.error("Error al crear preferencia de MercadoPago:", error);
    throw new Error(
      `Error al crear preferencia de MercadoPago: ${error.message}`
    );
  }
};

// Verificar estado de un pago
export const getPaymentStatus = async (paymentId) => {
  try {
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
