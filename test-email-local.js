// test-email-local.js - VERSIÓN CORREGIDA PARA CERTIFICADOS SSL
// Script para probar emails en localhost
// Ejecutar con: node test-email-local.js

const nodemailer = require("nodemailer");
require("dotenv").config({ path: ".env.local" });

// Colores para la consola
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Configuración
const config = {
  EMAIL_USER: process.env.EMAIL_USER || "patagoniascript@gmail.com",
  EMAIL_PASS: process.env.EMAIL_PASS || "ahgtrskdiqjfmxbh",
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "patagoniascript@gmail.com",
};

console.log(`${colors.cyan}=== TEST DE SISTEMA DE EMAILS ===${colors.reset}\n`);
console.log(`${colors.blue}Configuración actual:${colors.reset}`);
console.log(`EMAIL_USER: ${config.EMAIL_USER}`);
console.log(`EMAIL_SERVICE: ${config.EMAIL_SERVICE}`);
console.log(`ADMIN_EMAIL: ${config.ADMIN_EMAIL}`);
console.log(
  `EMAIL_PASS: ${config.EMAIL_PASS ? "***configurado***" : "NO CONFIGURADO"}\n`
);

// ✅ FUNCIÓN CORREGIDA para crear transportador con SSL fix
function createTransport() {
  console.log(
    `${colors.yellow}🔧 Creando transportador con configuración SSL corregida...${colors.reset}`
  );

  return nodemailer.createTransport({
    service: config.EMAIL_SERVICE,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
    // ✅ SOLUCIÓN para certificados SSL
    tls: {
      rejectUnauthorized: false, // Soluciona el error de certificados
    },
    // Configuraciones adicionales para mejor compatibilidad
    port: 587,
    secure: false, // true para 465, false para otros puertos
    requireTLS: true,
    // Debug para ver más detalles si es necesario
    debug: false, // Cambiar a true si quieres ver logs detallados
    logger: false,
  });
}

// Función para enviar email de prueba
async function testEmail() {
  try {
    // Crear transportador con configuración SSL corregida
    console.log(`${colors.yellow}1. Creando transportador...${colors.reset}`);
    const transporter = createTransport();

    // Verificar conexión
    console.log(`${colors.yellow}2. Verificando conexión...${colors.reset}`);

    // Agregar timeout para la verificación
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(new Error("Timeout - Verificación tardó más de 15 segundos")),
        15000
      )
    );

    await Promise.race([verifyPromise, timeoutPromise]);
    console.log(`${colors.green}✓ Conexión exitosa${colors.reset}\n`);

    // Enviar email de prueba
    console.log(
      `${colors.yellow}3. Enviando email de prueba...${colors.reset}`
    );

    const mailOptions = {
      from: `"Test IndumentariaSoffy" <${config.EMAIL_USER}>`,
      to: config.ADMIN_EMAIL,
      subject: "🧪 Test de Email - Sistema Funcionando ✅",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #10b981; text-align: center; margin-bottom: 30px;">
              ✅ Sistema de Email Funcionando
            </h1>
            
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #047857; margin: 0 0 10px 0;">🎉 Prueba Exitosa</h2>
              <p style="color: #065f46; margin: 0;">
                Si estás viendo este email, el sistema está configurado correctamente y el problema de certificados SSL fue solucionado.
              </p>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #92400e; margin: 0 0 10px 0;">🔧 Problema Solucionado:</h3>
              <p style="color: #92400e; margin: 0;">
                Se corrigió el error "self-signed certificate in certificate chain" agregando 
                <code>tls: { rejectUnauthorized: false }</code> a la configuración del transportador.
              </p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">📊 Detalles de la prueba:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li><strong>Enviado desde:</strong> ${config.EMAIL_USER}</li>
                <li><strong>Servicio:</strong> ${config.EMAIL_SERVICE}</li>
                <li><strong>Fecha:</strong> ${new Date().toLocaleString(
                  "es-AR"
                )}</li>
                <li><strong>Entorno:</strong> Desarrollo Local</li>
                <li><strong>SSL Fix:</strong> ✅ Aplicado</li>
              </ul>
            </div>
            
            <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0;">🚀 Próximos Pasos:</h3>
              <ol style="color: #1e3a8a; margin: 0; padding-left: 20px;">
                <li>Actualiza tu <code>lib/email-config.js</code> con la configuración SSL corregida</li>
                <li>Actualiza tu webhook de MercadoPago</li>
                <li>Realiza una compra de prueba</li>
                <li>Verifica que los emails de MercadoPago lleguen correctamente</li>
              </ol>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af;">
              <p style="margin: 0;">Este es un email de prueba del sistema IndumentariaSoffy</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">SSL Certificate issue fixed ✅</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Test de Email Exitoso!

Si recibes este email, el sistema está funcionando correctamente.
El problema de certificados SSL fue solucionado.

Detalles:
- Enviado desde: ${config.EMAIL_USER}
- Servicio: ${config.EMAIL_SERVICE}
- Fecha: ${new Date().toLocaleString("es-AR")}
- SSL Fix: Aplicado

Próximos pasos:
1. Actualizar lib/email-config.js
2. Actualizar webhook de MercadoPago
3. Hacer compra de prueba
4. Verificar emails de MercadoPago
      `,
    };

    // Enviar con timeout
    const sendPromise = transporter.sendMail(mailOptions);

    const info = await Promise.race([sendPromise, timeoutPromise]);

    console.log(`${colors.green}✓ Email enviado exitosamente${colors.reset}`);
    console.log(`Message ID: ${info.messageId}\n`);

    console.log(
      `${colors.green}✅ ¡ÉXITO! El sistema de emails está funcionando correctamente.${colors.reset}`
    );
    console.log(
      `${colors.cyan}Revisa tu bandeja de entrada en: ${config.ADMIN_EMAIL}${colors.reset}`
    );
    console.log(
      `${colors.yellow}💡 Si no lo ves, revisa la carpeta de SPAM${colors.reset}`
    );
  } catch (error) {
    console.error(`${colors.red}❌ ERROR:${colors.reset}`, error.message);

    // Mensajes de error específicos y soluciones
    if (error.message.includes("Invalid login")) {
      console.log(
        `\n${colors.yellow}🔐 PROBLEMA DE AUTENTICACIÓN:${colors.reset}`
      );
      console.log("1. Verifica que EMAIL_USER y EMAIL_PASS sean correctos");
      console.log(
        "2. Asegúrate de usar una 'App Password' de Google (no tu contraseña normal)"
      );
      console.log("3. Ve a: https://myaccount.google.com/apppasswords");
      console.log(
        "4. Genera una nueva para 'Mail' - 'Other (IndumentariaSoffy)'"
      );
    } else if (error.message.includes("certificate")) {
      console.log(
        `\n${colors.yellow}🔒 PROBLEMA DE CERTIFICADOS:${colors.reset}`
      );
      console.log("El script ya incluye la solución SSL, pero si persiste:");
      console.log("1. Puede ser un problema de red corporativa/firewall");
      console.log("2. Intenta desde otra red (datos móviles)");
      console.log("3. Contacta a tu admin de red si estás en una empresa");
    } else if (
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("ETIMEDOUT")
    ) {
      console.log(
        `\n${colors.yellow}🌐 PROBLEMA DE CONECTIVIDAD:${colors.reset}`
      );
      console.log("1. Verifica tu conexión a internet");
      console.log("2. Puede que tu firewall esté bloqueando SMTP");
      console.log("3. Intenta desde otra red");
      console.log("4. Algunos ISP bloquean puertos SMTP");
    } else if (error.message.includes("Timeout")) {
      console.log(`\n${colors.yellow}⏰ PROBLEMA DE TIEMPO:${colors.reset}`);
      console.log("1. La conexión está tardando demasiado");
      console.log("2. Puede ser un problema temporal de Gmail");
      console.log("3. Intenta de nuevo en unos minutos");
      console.log("4. Verifica tu conexión a internet");
    } else {
      console.log(`\n${colors.yellow}🔧 SOLUCIÓN GENERAL:${colors.reset}`);
      console.log("1. Verifica tu conexión a internet");
      console.log(
        "2. Asegúrate de que las variables de entorno sean correctas"
      );
      console.log("3. Regenera tu App Password de Gmail");
      console.log("4. Intenta desde otra red si estás en una corporativa");
    }
  }
}

// Función para simular email de orden (con SSL fix)
async function testOrderEmail() {
  console.log(
    `\n${colors.cyan}=== SIMULANDO EMAIL DE ORDEN ===${colors.reset}\n`
  );

  try {
    const transporter = createTransport(); // Usar la función corregida

    // Simular datos de orden
    const orderData = {
      orderId: "507f1f77bcf86cd799439011",
      customerName: "Juan Pérez",
      customerEmail: "juan@example.com",
      total: 2500,
      items: [
        { name: "Camiseta Azul", quantity: 2, price: 1000 },
        { name: "Pantalón Negro", quantity: 1, price: 500 },
      ],
    };

    await transporter.sendMail({
      from: `"IndumentariaSoffy" <${config.EMAIL_USER}>`,
      to: config.ADMIN_EMAIL,
      subject: `🛒 Nueva Orden #${orderData.orderId.substring(0, 8)} - $${
        orderData.total
      }`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="background: #1f2937; color: white; padding: 20px; text-align: center; margin: 0;">
            🛒 NUEVA ORDEN RECIBIDA
          </h1>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Orden #${orderData.orderId.substring(0, 8)}</h2>
            <p><strong>Cliente:</strong> ${orderData.customerName}</p>
            <p><strong>Email:</strong> ${orderData.customerEmail}</p>
            <p><strong>Total:</strong> $${orderData.total}</p>
            <h3>Productos:</h3>
            <ul>
              ${orderData.items
                .map(
                  (item) =>
                    `<li>${item.name} x${item.quantity} - $${item.price}</li>`
                )
                .join("")}
            </ul>
            <div style="background: #10b981; color: white; padding: 10px; border-radius: 5px; margin-top: 20px;">
              ✅ Email de orden enviado correctamente con SSL fix aplicado
            </div>
          </div>
        </div>
      `,
    });

    console.log(`${colors.green}✓ Email de orden enviado${colors.reset}`);
  } catch (error) {
    console.error(
      `${colors.red}❌ Error simulando orden:${colors.reset}`,
      error.message
    );
  }
}

// Función para simular email de pregunta (con SSL fix)
async function testQuestionEmail() {
  console.log(
    `\n${colors.cyan}=== SIMULANDO EMAIL DE PREGUNTA ===${colors.reset}\n`
  );

  try {
    const transporter = createTransport(); // Usar la función corregida

    await transporter.sendMail({
      from: `"IndumentariaSoffy" <${config.EMAIL_USER}>`,
      to: config.ADMIN_EMAIL,
      subject: "❓ Nueva pregunta sobre Camiseta Azul",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="background: #3b82f6; color: white; padding: 20px; text-align: center; margin: 0;">
            ❓ NUEVA PREGUNTA RECIBIDA
          </h1>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Producto: Camiseta Azul</h2>
            <p><strong>Cliente:</strong> María García</p>
            <p><strong>Email:</strong> maria@example.com</p>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Pregunta:</strong></p>
              <p style="margin: 10px 0; font-style: italic;">
                "¿Tienen este modelo en talla XL? ¿Cuánto demora el envío a Buenos Aires?"
              </p>
            </div>
            <a href="#" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Responder en Admin
            </a>
            <div style="background: #10b981; color: white; padding: 10px; border-radius: 5px; margin-top: 20px;">
              ✅ Email de pregunta enviado correctamente con SSL fix aplicado
            </div>
          </div>
        </div>
      `,
    });

    console.log(`${colors.green}✓ Email de pregunta enviado${colors.reset}`);
  } catch (error) {
    console.error(
      `${colors.red}❌ Error simulando pregunta:${colors.reset}`,
      error.message
    );
  }
}

// Menú interactivo
async function showMenu() {
  console.log(
    `\n${colors.cyan}=== MENÚ DE PRUEBAS (SSL CORREGIDO) ===${colors.reset}`
  );
  console.log("1. Test básico del sistema");
  console.log("2. Simular email de orden");
  console.log("3. Simular email de pregunta");
  console.log("4. Ejecutar todas las pruebas");
  console.log("5. Salir\n");
}

// Ejecutar pruebas
async function runTests() {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) =>
    new Promise((resolve) => readline.question(query, resolve));

  while (true) {
    showMenu();
    const choice = await question("Selecciona una opción (1-5): ");

    switch (choice) {
      case "1":
        await testEmail();
        break;
      case "2":
        await testOrderEmail();
        break;
      case "3":
        await testQuestionEmail();
        break;
      case "4":
        console.log(
          `${colors.cyan}🚀 Ejecutando todas las pruebas...${colors.reset}\n`
        );
        await testEmail();
        await testOrderEmail();
        await testQuestionEmail();
        console.log(
          `${colors.green}\n✅ Todas las pruebas completadas${colors.reset}`
        );
        break;
      case "5":
        console.log(`${colors.green}¡Hasta luego!${colors.reset}`);
        readline.close();
        process.exit(0);
      default:
        console.log(`${colors.red}Opción inválida${colors.reset}`);
    }

    await question("\nPresiona Enter para continuar...");
  }
}

// Iniciar con mensaje de bienvenida
console.log(
  `${colors.green}🔧 SSL Certificate fix aplicado automáticamente${colors.reset}`
);
console.log(
  `${colors.yellow}💡 Este script corrige el error 'self-signed certificate in certificate chain'${colors.reset}\n`
);

runTests().catch(console.error);
