// /lib/emailTemplates.js

// Template para orden completada (Usuario)
export const orderConfirmationTemplate = (orderData) => {
  const { orderId, userName, products, total, shippingAddress } = orderData;

  const productsList = products
    .map(
      (product) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
          <img src="${product.image}" alt="${
        product.name
      }" style="width: 60px; height: 60px; object-fit: cover;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${
          product.name
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: center;">${
          product.quantity
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${
          product.price
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${
          product.price * product.quantity
        }</td>
      </tr>
    `
    )
    .join("");

  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Confirmación de Orden</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">¡Gracias por tu compra!</h1>
          </div>
          
          <div style="padding: 30px;">
            <p>Hola ${userName},</p>
            <p>Tu orden ha sido confirmada exitosamente. A continuación encontrarás los detalles:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Orden #${orderId}</h3>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString(
                "es-ES"
              )}</p>
            </div>
            
            <h3>Productos:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f0f0f0;">
                  <th style="padding: 10px; text-align: left;">Imagen</th>
                  <th style="padding: 10px; text-align: left;">Producto</th>
                  <th style="padding: 10px; text-align: center;">Cantidad</th>
                  <th style="padding: 10px; text-align: right;">Precio</th>
                  <th style="padding: 10px; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${productsList}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px; color: #4CAF50;">$${total}</td>
                </tr>
              </tfoot>
            </table>
            
            <h3>Dirección de envío:</h3>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
              <p style="margin: 5px 0;">${shippingAddress.street}</p>
              <p style="margin: 5px 0;">${shippingAddress.city}, ${
    shippingAddress.state
  } ${shippingAddress.zipCode}</p>
              <p style="margin: 5px 0;">${shippingAddress.country}</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${
                process.env.NEXT_PUBLIC_URL
              }/orders/${orderId}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver detalles de la orden</a>
            </div>
          </div>
          
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; color: #666;">
            <p style="margin: 0;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p style="margin: 5px 0;">© 2024 Tu Ecommerce</p>
          </div>
        </div>
      </body>
      </html>
    `;
};

// Template para nueva orden (Administrador)
export const adminOrderNotificationTemplate = (orderData) => {
  const {
    orderId,
    userName,
    userEmail,
    products,
    total,
    shippingAddress,
    paymentMethod,
  } = orderData;

  const productsList = products
    .map(
      (product) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${
          product.name
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${
          product.quantity
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${
          product.price
        }</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${
          product.price * product.quantity
        }</td>
      </tr>
    `
    )
    .join("");

  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Nueva Orden Recibida</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Nueva Orden Recibida</h1>
          </div>
          
          <div style="padding: 30px;">
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #1976D2;">Orden #${orderId}</h3>
              <p><strong>Fecha:</strong> ${new Date().toLocaleString(
                "es-ES"
              )}</p>
              <p><strong>Estado:</strong> <span style="color: #4CAF50; font-weight: bold;">Pagado</span></p>
            </div>
            
            <h3>Información del Cliente:</h3>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p><strong>Nombre:</strong> ${userName}</p>
              <p><strong>Email:</strong> ${userEmail}</p>
              <p><strong>Método de pago:</strong> ${paymentMethod}</p>
            </div>
            
            <h3>Productos Ordenados:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f0f0f0;">
                  <th style="padding: 8px; text-align: left;">Producto</th>
                  <th style="padding: 8px; text-align: center;">Cantidad</th>
                  <th style="padding: 8px; text-align: right;">Precio</th>
                  <th style="padding: 8px; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${productsList}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 18px; color: #2196F3;">$${total}</td>
                </tr>
              </tfoot>
            </table>
            
            <h3>Dirección de Envío:</h3>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p>${shippingAddress.street}</p>
              <p>${shippingAddress.city}, ${shippingAddress.state} ${
    shippingAddress.zipCode
  }</p>
              <p>${shippingAddress.country}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${
                process.env.NEXT_PUBLIC_URL
              }/admin/orders/${orderId}" style="background-color: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver en el Panel de Admin</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
};

// Template para mensajes/comentarios
export const messageNotificationTemplate = (messageData) => {
  const {
    senderName,
    recipientName,
    productName,
    productImage,
    message,
    messageType,
    productId,
  } = messageData;

  const title =
    messageType === "question" ? "Nueva Pregunta" : "Nueva Respuesta";
  const actionText =
    messageType === "question" ? "Responder Pregunta" : "Ver Conversación";

  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="background-color: #FF9800; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">${title}</h1>
          </div>
          
          <div style="padding: 30px;">
            <p>Hola ${recipientName},</p>
            <p>${senderName} ha ${
    messageType === "question" ? "realizado una pregunta" : "respondido"
  } sobre el siguiente producto:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; display: flex; align-items: center;">
              <img src="${productImage}" alt="${productName}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px; margin-right: 15px;">
              <div>
                <h3 style="margin: 0 0 5px 0;">${productName}</h3>
                <a href="${
                  process.env.NEXT_PUBLIC_URL
                }/products/${productId}" style="color: #FF9800; text-decoration: none;">Ver producto</a>
              </div>
            </div>
            
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 5px; border-left: 4px solid #FF9800;">
              <h4 style="margin-top: 0;">${
                messageType === "question" ? "Pregunta:" : "Respuesta:"
              }</h4>
              <p style="margin: 0; line-height: 1.6;">${message}</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_URL}/${
    recipientName === "Administrador" ? "admin" : "account"
  }/messages" style="background-color: #FF9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">${actionText}</a>
            </div>
          </div>
          
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; color: #666;">
            <p style="margin: 0;">Este es un mensaje automático, por favor no responder a este email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
};
