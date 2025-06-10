// src/lib/email-templates.js

// Template base para todos los emails
const baseTemplate = (content, title = "IndumentariaSoffy") => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #4f46e5;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .content {
            padding: 30px 20px;
            line-height: 1.6;
        }
        .order-summary {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .product-item {
            display: flex;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .product-item:last-child {
            border-bottom: none;
        }
        .product-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            margin-right: 15px;
        }
        .product-details {
            flex: 1;
        }
        .product-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .product-price {
            color: #4f46e5;
            font-weight: bold;
        }
        .total-section {
            background-color: #4f46e5;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .button {
            display: inline-block;
            background-color: #4f46e5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .social-links {
            margin: 15px 0;
        }
        .social-links a {
            margin: 0 10px;
            color: #4f46e5;
            text-decoration: none;
        }
        .shipping-info {
            background-color: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #d97706;
        }
        .status-paid {
            background-color: #d1fae5;
            color: #059669;
        }
        .admin-section {
            background-color: #fee2e2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>IndumentariaSoffy</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <div class="social-links">
                <a href="https://www.instagram.com/indumentaria_soffy">Instagram</a>
                <a href="https://wa.me/5491126907696">WhatsApp</a>
            </div>
            <p>© 2024 IndumentariaSoffy. Todos los derechos reservados.</p>
            <p>14 de julio 2698, Castelar Sur</p>
            <p>Si tienes alguna pregunta, contáctanos respondiendo a este email.</p>
        </div>
    </div>
</body>
</html>
`;

// 1. Email de confirmación de orden para el cliente
export const orderConfirmationTemplate = (order, user) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const productsHtml = order.items
    .map(
      (item) => `
    <div class="product-item">
      <img src="${item.imageUrl}" alt="${item.title}" class="product-image" />
      <div class="product-details">
        <div class="product-name">${item.title}</div>
        <div>Cantidad: ${item.quantity}</div>
        <div class="product-price">$${(item.price * item.quantity).toFixed(
          2
        )}</div>
      </div>
    </div>
  `
    )
    .join("");

  const statusBadge =
    order.status === "pagado"
      ? '<span class="status-badge status-paid">Pagado</span>'
      : '<span class="status-badge status-pending">Pendiente</span>';

  const content = `
    <h2>¡Gracias por tu pedido, ${user.name}!</h2>
    
    <p>Hemos recibido tu pedido correctamente. A continuación encontrarás todos los detalles:</p>
    
    <div class="order-summary">
      <h3>Resumen del Pedido #${order._id.substring(0, 8)}</h3>
      <p><strong>Fecha:</strong> ${orderDate}</p>
      <p><strong>Estado:</strong> ${statusBadge}</p>
      <p><strong>Método de pago:</strong> ${
        order.paymentMethod === "mercadopago"
          ? "MercadoPago"
          : order.paymentMethod
      }</p>
      
      <h4>Productos:</h4>
      ${productsHtml}
      
      <div class="total-section">
        <h3>Total: $${order.totalAmount.toFixed(2)}</h3>
      </div>
    </div>

    <div class="shipping-info">
      <h4>📦 Información de envío:</h4>
      <p><strong>Nombre:</strong> ${order.shippingInfo.name}</p>
      <p><strong>Dirección:</strong> ${order.shippingInfo.address}</p>
      <p><strong>Ciudad:</strong> ${order.shippingInfo.city}</p>
      <p><strong>Código Postal:</strong> ${order.shippingInfo.postalCode}</p>
      <p><strong>Teléfono:</strong> ${order.shippingInfo.phone}</p>
    </div>

    ${
      order.paymentMethod === "mercadopago" && order.status === "pendiente"
        ? `
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>⏳ Pendiente de pago</h4>
        <p>Tu pedido está pendiente de pago. Una vez que completes el pago a través de MercadoPago, recibirás un email de confirmación y procederemos a preparar tu envío.</p>
      </div>
    `
        : ""
    }

    ${
      order.paymentMethod === "whatsapp"
        ? `
      <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>💬 Pedido por WhatsApp</h4>
        <p>Tu pedido será procesado y nos pondremos en contacto contigo por WhatsApp para coordinar el pago y envío.</p>
        <a href="https://wa.me/5491126907696" class="button">Contactar por WhatsApp</a>
      </div>
    `
        : ""
    }

    <p>📧 <strong>¿Necesitas ayuda?</strong> Puedes responder a este email o contactarnos por WhatsApp.</p>
    
    <p>¡Gracias por confiar en IndumentariaSoffy!</p>
  `;

  return baseTemplate(
    content,
    `Confirmación de Pedido #${order._id.substring(0, 8)}`
  );
};

// 2. Email de notificación para el admin
export const adminOrderNotificationTemplate = (order, user) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const productsHtml = order.items
    .map(
      (item) => `
    <div class="product-item">
      <img src="${item.imageUrl}" alt="${item.title}" class="product-image" />
      <div class="product-details">
        <div class="product-name">${item.title}</div>
        <div>Cantidad: ${item.quantity} × $${item.price.toFixed(2)}</div>
        <div class="product-price">Subtotal: $${(
          item.price * item.quantity
        ).toFixed(2)}</div>
      </div>
    </div>
  `
    )
    .join("");

  const content = `
    <div class="admin-section">
      <h2>🚨 Nueva Orden Recibida</h2>
      <p><strong>¡Tienes una nueva orden para procesar!</strong></p>
    </div>
    
    <div class="order-summary">
      <h3>Pedido #${order._id.substring(0, 8)}</h3>
      <p><strong>Fecha:</strong> ${orderDate}</p>
      <p><strong>Cliente:</strong> ${user.name} (${user.email})</p>
      <p><strong>Teléfono:</strong> ${
        user.phone || order.shippingInfo.phone
      }</p>
      <p><strong>Método de pago:</strong> ${
        order.paymentMethod === "mercadopago"
          ? "MercadoPago"
          : order.paymentMethod
      }</p>
      <p><strong>Estado:</strong> ${order.status}</p>
      
      <h4>Productos vendidos:</h4>
      ${productsHtml}
      
      <div class="total-section">
        <h3>Total de la venta: $${order.totalAmount.toFixed(2)}</h3>
      </div>
    </div>

    <div class="shipping-info">
      <h4>📦 Datos de envío del cliente:</h4>
      <p><strong>Nombre completo:</strong> ${order.shippingInfo.name}</p>
      <p><strong>Email:</strong> ${order.shippingInfo.email}</p>
      <p><strong>Teléfono:</strong> ${order.shippingInfo.phone}</p>
      <p><strong>Dirección:</strong> ${order.shippingInfo.address}</p>
      <p><strong>Ciudad:</strong> ${order.shippingInfo.city}</p>
      <p><strong>Código Postal:</strong> ${order.shippingInfo.postalCode}</p>
    </div>

    ${
      order.paymentMethod === "whatsapp"
        ? `
      <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>💬 Acción requerida - Pedido por WhatsApp</h4>
        <p>Este pedido fue realizado por WhatsApp. Debes contactar al cliente para coordinar el pago y envío.</p>
        <a href="https://wa.me/54${order.shippingInfo.phone.replace(
          /\D/g,
          ""
        )}" class="button">Contactar Cliente por WhatsApp</a>
      </div>
    `
        : ""
    }

    <div style="margin: 30px 0; text-align: center;">
      <a href="${process.env.NEXTAUTH_URL}/admin/orders/${
    order._id
  }" class="button">
        Ver Orden Completa en Admin
      </a>
    </div>

    <p><strong>Próximos pasos:</strong></p>
    <ul>
      <li>Verificar disponibilidad de productos</li>
      <li>Confirmar el pago (si es MercadoPago, se confirmará automáticamente)</li>
      <li>Preparar el envío</li>
      <li>Actualizar el estado de la orden</li>
      <li>Contactar al cliente si es necesario</li>
    </ul>
  `;

  return baseTemplate(
    content,
    `🚨 Nueva Orden #${order._id.substring(0, 8)} - IndumentariaSoffy`
  );
};

// 3. Email de confirmación de pago para el cliente
export const paymentConfirmationTemplate = (order, user, paymentInfo) => {
  const paymentDate = paymentInfo.date_approved
    ? new Date(paymentInfo.date_approved).toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Fecha no disponible";

  const content = `
    <h2>¡Pago confirmado! 🎉</h2>
    
    <p>Hola ${user.name},</p>
    
    <p>¡Excelentes noticias! Hemos confirmado tu pago y ahora procederemos a preparar tu pedido.</p>
    
    <div class="order-summary">
      <h3>✅ Detalles del Pago</h3>
      <p><strong>Pedido:</strong> #${order._id.substring(0, 8)}</p>
      <p><strong>Fecha del pago:</strong> ${paymentDate}</p>
      <p><strong>Método de pago:</strong> ${
        paymentInfo.payment_method_id || "MercadoPago"
      }</p>
      <p><strong>ID de transacción:</strong> ${paymentInfo.id}</p>
      
      <div class="total-section">
        <h3>Monto pagado: $${order.totalAmount.toFixed(2)}</h3>
      </div>
    </div>

    <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h4>📦 ¿Qué sigue ahora?</h4>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Preparamos tu pedido con mucho cuidado</li>
        <li>Te contactaremos para coordinar la entrega</li>
        <li>Recibirás un email cuando tu pedido esté en camino</li>
      </ul>
    </div>

    <div class="shipping-info">
      <h4>📍 Envío a:</h4>
      <p>${order.shippingInfo.name}</p>
      <p>${order.shippingInfo.address}</p>
      <p>${order.shippingInfo.city}, ${order.shippingInfo.postalCode}</p>
    </div>

    <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://wa.me/5491126907696" class="button">Contactar por WhatsApp</a>
    </div>
    
    <p>¡Gracias por tu compra!</p>
  `;

  return baseTemplate(
    content,
    `✅ Pago Confirmado - Pedido #${order._id.substring(0, 8)}`
  );
};

// 4. Email de notificación de pago para el admin
export const adminPaymentNotificationTemplate = (order, user, paymentInfo) => {
  const paymentDate = paymentInfo.date_approved
    ? new Date(paymentInfo.date_approved).toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Fecha no disponible";

  const content = `
    <div class="admin-section">
      <h2>💰 Pago Confirmado</h2>
      <p><strong>¡El pago ha sido procesado exitosamente!</strong></p>
    </div>
    
    <div class="order-summary">
      <h3>Detalles del Pago</h3>
      <p><strong>Pedido:</strong> #${order._id.substring(0, 8)}</p>
      <p><strong>Cliente:</strong> ${user.name} (${user.email})</p>
      <p><strong>Fecha del pago:</strong> ${paymentDate}</p>
      <p><strong>Método de pago:</strong> ${
        paymentInfo.payment_method_id || "MercadoPago"
      }</p>
      <p><strong>ID de transacción:</strong> ${paymentInfo.id}</p>
      <p><strong>Estado MercadoPago:</strong> ${paymentInfo.status}</p>
      
      <div class="total-section">
        <h3>Monto recibido: $${order.totalAmount.toFixed(2)}</h3>
      </div>
    </div>

    <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4>🚀 Acción requerida</h4>
      <p><strong>El pedido está listo para ser preparado y enviado.</strong></p>
      <ul>
        <li>Verificar stock de productos</li>
        <li>Preparar el paquete</li>
        <li>Actualizar estado a "preparando envío"</li>
        <li>Coordinar entrega con el cliente</li>
      </ul>
    </div>

    <div class="shipping-info">
      <h4>📦 Datos de envío:</h4>
      <p><strong>Nombre:</strong> ${order.shippingInfo.name}</p>
      <p><strong>Dirección:</strong> ${order.shippingInfo.address}</p>
      <p><strong>Ciudad:</strong> ${order.shippingInfo.city}</p>
      <p><strong>Código Postal:</strong> ${order.shippingInfo.postalCode}</p>
      <p><strong>Teléfono:</strong> ${order.shippingInfo.phone}</p>
    </div>

    <div style="margin: 30px 0; text-align: center;">
      <a href="${process.env.NEXTAUTH_URL}/admin/orders/${
    order._id
  }" class="button">
        Gestionar Pedido en Admin
      </a>
    </div>

    <p><strong>Información de MercadoPago:</strong></p>
    <ul>
      <li><strong>Transaction ID:</strong> ${paymentInfo.id}</li>
      <li><strong>Status:</strong> ${paymentInfo.status}</li>
      <li><strong>Payment Type:</strong> ${paymentInfo.payment_type_id}</li>
      <li><strong>Installments:</strong> ${paymentInfo.installments || 1}</li>
    </ul>
  `;

  return baseTemplate(
    content,
    `💰 Pago Confirmado - Pedido #${order._id.substring(0, 8)}`
  );
};
