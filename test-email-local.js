// test-email-local.js
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
  EMAIL_PASS: process.env.EMAIL_PASS || "gnpbxdmpuemjguqz",
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

// Función para enviar email de prueba
async function testEmail() {
  try {
    // Crear transportador
    console.log(`${colors.yellow}1. Creando transportador...${colors.reset}`);
    const transporter = nodemailer.createTransporter({
      service: config.EMAIL_SERVICE,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
      },
    });

    // Verificar conexión
    console.log(`${colors.yellow}2. Verificando conexión...${colors.reset}`);
    await transporter.verify();
    console.log(`${colors.green}✓ Conexión exitosa${colors.reset}\n`);

    // Enviar email de prueba
    console.log(
      `${colors.yellow}3. Enviando email de prueba...${colors.reset}`
    );
    const info = await transporter.sendMail({
      from: `"Test IndumentariaSoffy" <${config.EMAIL_USER}>`,
      to: config.ADMIN_EMAIL,
      subject: "🧪 Test de Email - Sistema Funcionando",
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
              <h2 style="color: #047857; margin: 0 0 10px 0;">Prueba Exitosa</h2>
              <p style="color: #065f46; margin: 0;">
                Si estás viendo este email, el sistema está configurado correctamente.
              </p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">Detalles de la prueba:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li><strong>Enviado desde:</strong> ${config.EMAIL_USER}</li>
                <li><strong>Servicio:</strong> ${config.EMAIL_SERVICE}</li>
                <li><strong>Fecha:</strong> ${new Date().toLocaleString(
                  "es-AR"
                )}</li>
                <li><strong>Entorno:</strong> Desarrollo Local</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af;">
              <p style="margin: 0;">Este es un email de prueba del sistema IndumentariaSoffy</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`${colors.green}✓ Email enviado exitosamente${colors.reset}`);
    console.log(`Message ID: ${info.messageId}\n`);

    console.log(
      `${colors.green}✅ ¡ÉXITO! El sistema de emails está funcionando correctamente.${colors.reset}`
    );
    console.log(
      `${colors.cyan}Revisa tu bandeja de entrada en: ${config.ADMIN_EMAIL}${colors.reset}`
    );
  } catch (error) {
    console.error(`${colors.red}❌ ERROR:${colors.reset}`, error.message);

    // Mensajes de error específicos
    if (error.message.includes("Invalid login")) {
      console.log(`\n${colors.yellow}Solución:${colors.reset}`);
      console.log("1. Verifica que EMAIL_USER y EMAIL_PASS sean correctos");
      console.log(
        '2. Asegúrate de usar una "Contraseña de aplicación" de Google'
      );
      console.log("3. Ve a: https://myaccount.google.com/apppasswords");
    } else if (error.message.includes("ECONNREFUSED")) {
      console.log(`\n${colors.yellow}Solución:${colors.reset}`);
      console.log("1. Verifica tu conexión a internet");
      console.log("2. Puede que Gmail esté bloqueando la conexión");
    }
  }
}

// Función para simular email de orden
async function testOrderEmail() {
  console.log(
    `\n${colors.cyan}=== SIMULANDO EMAIL DE ORDEN ===${colors.reset}\n`
  );

  try {
    const transporter = nodemailer.createTransporter({
      service: config.EMAIL_SERVICE,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
      },
    });

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

// Función para simular email de pregunta
async function testQuestionEmail() {
  console.log(
    `\n${colors.cyan}=== SIMULANDO EMAIL DE PREGUNTA ===${colors.reset}\n`
  );

  try {
    const transporter = nodemailer.createTransporter({
      service: config.EMAIL_SERVICE,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
      },
    });

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
  console.log(`\n${colors.cyan}=== MENÚ DE PRUEBAS ===${colors.reset}`);
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
        await testEmail();
        await testOrderEmail();
        await testQuestionEmail();
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

// Iniciar
runTests().catch(console.error);
