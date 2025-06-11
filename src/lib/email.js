// 📤 EXPORTACIONES (asegurar que todas estén disponibles)
export {
  createEmailTransporter,
  getOrderProductsData,
  orderConfirmationTemplate,
  adminOrderNotificationTemplate,
  sendOrderConfirmationToCustomer,
  sendNewOrderNotificationToAdmin,
  sendPaymentConfirmationToCustomer,
  sendPaymentNotificationToAdmin,
  sendPaymentConfirmedEmails,
  resendEmails,
}; // lib/order-emails.js
import { createEmailTransporter } from "./email";
import {
  orderConfirmationTemplate,
  adminOrderNotificationTemplate,
} from "./emailTemplates";
import Product from "@/models/Product";

// Función para obtener productos poblados de una orden
async function getOrderProductsData(orderItems) {
  const productIds = orderItems.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });

  return orderItems.map((item) => {
    const productData = products.find(
      (p) => p._id.toString() === item.product.toString()
    );
    return {
      id: item.product,
      name: item.title,
      quantity: item.quantity,
      price: item.price,
      image: item.imageUrl,
      subtotal: item.quantity * item.price,
      // Agregar datos adicionales del producto si existen
      ...productData?.toObject(),
    };
  });
}

// Función para enviar email de confirmación al cliente (cuando se confirma el pago)
async function sendPaymentConfirmationToCustomer(
  order,
  user,
  paymentInfo = null
) {
  try {
    console.log(`📧 Enviando confirmación de PAGO al cliente: ${user.email}`);

    const transporter = createEmailTransporter();

    // Obtener datos completos de los productos
    const productsData = await getOrderProductsData(order.items);

    // Preparar datos para el template
    const orderData = {
      orderId: order._id.toString(),
      userName: user.name || order.shippingInfo.name,
      userEmail: user.email,
      products: productsData,
      total: order.totalAmount,
      orderDate: order.createdAt,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentInfo: paymentInfo
        ? {
            id: paymentInfo.id,
            status: paymentInfo.status,
            method: paymentInfo.payment_method_id,
            type: paymentInfo.payment_type_id,
          }
        : null,
      shippingAddress: {
        street: order.shippingInfo.address,
        city: order.shippingInfo.city,
        state: "Buenos Aires",
        zipCode: order.shippingInfo.postalCode,
        country: "Argentina",
      },
    };

    // Generar el HTML del email (usar template de confirmación de pago)
    const emailHtml = orderConfirmationTemplate(orderData);

    // Configurar el email
    const mailOptions = {
      from: `"Tu Tienda" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `✅ Pago Confirmado - Orden #${order._id.toString().slice(-8)}`,
      html: emailHtml,
    };

    // Enviar el email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email de confirmación de pago enviado al cliente:", {
      messageId: info.messageId,
      to: user.email,
      orderId: order._id,
    });

    return {
      success: true,
      messageId: info.messageId,
      type: "payment_confirmation_customer",
    };
  } catch (error) {
    console.error(
      "❌ Error enviando email de confirmación de pago al cliente:",
      error
    );
    return {
      success: false,
      error: error.message,
      type: "payment_confirmation_customer",
    };
  }
}

// Función para enviar notificación de pago al administrador
async function sendPaymentNotificationToAdmin(order, user, paymentInfo = null) {
  try {
    // Email del administrador (desde variables de entorno)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    if (!adminEmail) {
      console.warn("⚠️ No se encontró email de administrador configurado");
      return {
        success: false,
        error: "Admin email not configured",
        type: "payment_notification_admin",
      };
    }

    console.log(`📧 Enviando notificación de PAGO al admin: ${adminEmail}`);

    const transporter = createEmailTransporter();

    // Obtener datos completos de los productos
    const productsData = await getOrderProductsData(order.items);

    // Preparar datos para el template
    const orderData = {
      orderId: order._id.toString(),
      userName: user.name || order.shippingInfo.name,
      userEmail: user.email,
      products: productsData,
      total: order.totalAmount,
      orderDate: order.createdAt,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentInfo: paymentInfo
        ? {
            id: paymentInfo.id,
            status: paymentInfo.status,
            method: paymentInfo.payment_method_id,
            type: paymentInfo.payment_type_id,
          }
        : null,
      shippingAddress: {
        street: order.shippingInfo.address,
        city: order.shippingInfo.city,
        state: "Buenos Aires",
        zipCode: order.shippingInfo.postalCode,
        country: "Argentina",
      },
    };

    // Generar el HTML del email
    const emailHtml = adminOrderNotificationTemplate(orderData);

    // Configurar el email
    const mailOptions = {
      from: `"Sistema Tienda" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `💰 Pago Confirmado - Orden #${order._id.toString().slice(-8)}`,
      html: emailHtml,
    };

    // Enviar el email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email de notificación de pago enviado al admin:", {
      messageId: info.messageId,
      to: adminEmail,
      orderId: order._id,
    });

    return {
      success: true,
      messageId: info.messageId,
      type: "payment_notification_admin",
    };
  } catch (error) {
    console.error("❌ Error enviando notificación de pago al admin:", error);
    return {
      success: false,
      error: error.message,
      type: "payment_notification_admin",
    };
  }
}

// Función para enviar email de confirmación al cliente (creación de orden)
async function sendOrderConfirmationToCustomer(order, user) {
  try {
    console.log(`📧 Enviando confirmación de orden al cliente: ${user.email}`);

    const transporter = createEmailTransporter();

    // Obtener datos completos de los productos
    const productsData = await getOrderProductsData(order.items);

    // Preparar datos para el template
    const orderData = {
      orderId: order._id.toString(),
      userName: user.name || order.shippingInfo.name,
      userEmail: user.email,
      products: productsData,
      total: order.totalAmount,
      orderDate: order.createdAt,
      status: order.status,
      paymentMethod: order.paymentMethod,
      shippingAddress: {
        street: order.shippingInfo.address,
        city: order.shippingInfo.city,
        state: "Buenos Aires", // Ajustar según tu lógica
        zipCode: order.shippingInfo.postalCode,
        country: "Argentina",
      },
    };

    // Generar el HTML del email
    const emailHtml = orderConfirmationTemplate(orderData);

    // Configurar el email
    const mailOptions = {
      from: `"Tu Tienda" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Confirmación de Orden #${order._id.toString().slice(-8)}`,
      html: emailHtml,
    };

    // Enviar el email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email de confirmación enviado al cliente:", {
      messageId: info.messageId,
      to: user.email,
      orderId: order._id,
    });

    return {
      success: true,
      messageId: info.messageId,
      type: "customer_confirmation",
    };
  } catch (error) {
    console.error("❌ Error enviando email de confirmación al cliente:", error);
    return {
      success: false,
      error: error.message,
      type: "customer_confirmation",
    };
  }
}

// Función para enviar notificación al administrador (creación de orden)
async function sendNewOrderNotificationToAdmin(order, user) {
  try {
    // Email del administrador (desde variables de entorno)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    if (!adminEmail) {
      console.warn("⚠️ No se encontró email de administrador configurado");
      return {
        success: false,
        error: "Admin email not configured",
        type: "admin_notification",
      };
    }

    console.log(
      `📧 Enviando notificación de nueva orden al admin: ${adminEmail}`
    );

    const transporter = createEmailTransporter();

    // Obtener datos completos de los productos
    const productsData = await getOrderProductsData(order.items);

    // Preparar datos para el template
    const orderData = {
      orderId: order._id.toString(),
      userName: user.name || order.shippingInfo.name,
      userEmail: user.email,
      products: productsData,
      total: order.totalAmount,
      orderDate: order.createdAt,
      status: order.status,
      paymentMethod: order.paymentMethod,
      shippingAddress: {
        street: order.shippingInfo.address,
        city: order.shippingInfo.city,
        state: "Buenos Aires",
        zipCode: order.shippingInfo.postalCode,
        country: "Argentina",
      },
    };

    // Generar el HTML del email
    const emailHtml = adminOrderNotificationTemplate(orderData);

    // Configurar el email
    const mailOptions = {
      from: `"Sistema Tienda" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🛒 Nueva Orden Recibida #${order._id.toString().slice(-8)}`,
      html: emailHtml,
    };

    // Enviar el email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email de notificación enviado al admin:", {
      messageId: info.messageId,
      to: adminEmail,
      orderId: order._id,
    });

    return {
      success: true,
      messageId: info.messageId,
      type: "admin_notification",
    };
  } catch (error) {
    console.error("❌ Error enviando notificación al admin:", error);
    return {
      success: false,
      error: error.message,
      type: "admin_notification",
    };
  }
}

// Función para enviar emails cuando el pago se confirma (usa las funciones correctas)
async function sendPaymentConfirmedEmails(order, user) {
  try {
    console.log(
      `💳 Enviando emails de pago confirmado para orden: ${order._id}`
    );

    const results = [];

    // Email al cliente usando la función de confirmación de pago
    const customerResult = await sendPaymentConfirmationToCustomer(order, user);
    results.push(customerResult);

    // Email al administrador usando la función de notificación de pago
    const adminResult = await sendPaymentNotificationToAdmin(order, user);
    results.push(adminResult);

    return {
      success: results.every((r) => r.success),
      results,
      orderData: {
        orderId: order._id,
        userEmail: user.email,
        status: order.status,
      },
    };
  } catch (error) {
    console.error(
      "❌ Error general enviando emails de pago confirmado:",
      error
    );
    return {
      success: false,
      error: error.message,
      results: [],
    };
  }
}

// Función para reenviar emails de orden (útil para casos de error)
async function resendOrderEmails(orderId, emailTypes = ["customer", "admin"]) {
  try {
    console.log(`🔄 Reenviando emails para orden: ${orderId}`);

    // Buscar la orden con el usuario
    const Order = (await import("@/models/Order")).default;
    const User = (await import("@/models/User")).default;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Orden no encontrada");
    }

    const user = await User.findById(order.user);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const results = [];

    if (emailTypes.includes("customer")) {
      // Para reenvío, usar función de confirmación de orden (no de pago)
      const customerResult = await sendOrderConfirmationToCustomer(order, user);
      results.push(customerResult);
    }

    if (emailTypes.includes("admin")) {
      // Para reenvío, usar función de notificación de nueva orden (no de pago)
      const adminResult = await sendNewOrderNotificationToAdmin(order, user);
      results.push(adminResult);
    }

    return {
      success: results.every((r) => r.success),
      results,
      orderData: {
        orderId: order._id,
        userEmail: user.email,
        status: order.status,
      },
    };
  } catch (error) {
    console.error("❌ Error reenviando emails:", error);
    return {
      success: false,
      error: error.message,
      results: [],
    };
  }
}
