import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
// Comentar temporalmente para pruebas
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  sendOrderConfirmationToCustomer,
  sendNewOrderNotificationToAdmin,
  sendPaymentConfirmationToCustomer,
  sendPaymentNotificationToAdmin,
  resendEmails,
} from "@/lib/order-emails";

// Test de configuración de email
function testEmailConfig() {
  const requiredVars = ["EMAIL_USER", "EMAIL_PASS"];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    return {
      success: false,
      message: `❌ Variables de entorno faltantes: ${missing.join(", ")}`,
      missing: missing,
      suggestions: [
        "Verificar que EMAIL_USER esté configurado (ej: tu-email@gmail.com)",
        "Verificar que EMAIL_PASS esté configurado (para Gmail usar App Password)",
        "Para Gmail: Activar verificación en 2 pasos y generar App Password",
      ],
    };
  }

  return {
    success: true,
    message: "✅ Conexión de email configurada correctamente",
    config: {
      user: process.env.EMAIL_USER,
      adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      service: "gmail",
    },
  };
}

export async function POST(request) {
  try {
    // 🔒 COMENTAR TEMPORALMENTE PARA PRUEBAS
    /*
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }
    */

    await connectDB();
    const body = await request.json();
    const { action } = body;

    console.log(`🧪 Ejecutando acción de prueba: ${action}`);

    switch (action) {
      // 🔧 TEST CONNECTION
      case "test_connection": {
        const configTest = testEmailConfig();
        return NextResponse.json(configTest);
      }

      // 📦 CREATE TEST ORDER
      case "create_test_order": {
        console.log("📦 Creando orden de prueba...");

        // Buscar o crear usuario de prueba
        let testUser = await User.findOne({ email: "test@example.com" });
        if (!testUser) {
          console.log("👤 Creando usuario de prueba...");
          testUser = new User({
            name: "Usuario de Prueba",
            email: "test@example.com",
            password: "test123456", // Campo requerido
            phone: "+54 11 1234-5678", // Campo requerido
            role: "user",
          });
          await testUser.save();
          console.log("✅ Usuario de prueba creado:", testUser._id);
        } else {
          console.log(
            "✅ Usuario de prueba existente encontrado:",
            testUser._id
          );
          // Verificar que tenga todos los campos necesarios
          if (!testUser.phone) {
            testUser.phone = "+54 11 1234-5678";
            await testUser.save();
            console.log("✅ Usuario actualizado con teléfono");
          }
        }

        // Buscar productos existentes o crear productos de prueba
        let products = await Product.find().limit(2);
        if (products.length === 0) {
          console.log("🛍️ No hay productos, creando productos de prueba...");

          const testProducts = [
            {
              title: "Producto de Prueba 1",
              description: "Descripción del producto de prueba 1",
              price: 25.99,
              images: ["https://via.placeholder.com/200x200?text=Producto+1"],
              category: "test",
              stock: 10,
              isActive: true,
            },
            {
              title: "Producto de Prueba 2",
              description: "Descripción del producto de prueba 2",
              price: 35.99,
              images: ["https://via.placeholder.com/200x200?text=Producto+2"],
              category: "test",
              stock: 5,
              isActive: true,
            },
          ];

          products = await Product.insertMany(testProducts);
          console.log("✅ Productos de prueba creados:", products.length);
        } else {
          console.log("✅ Productos existentes encontrados:", products.length);
        }

        // Crear orden de prueba
        const testOrder = new Order({
          user: testUser._id,
          items: products.map((product, index) => ({
            product: product._id,
            quantity: index + 1,
            price: product.price || 25.99,
            title: product.title || product.name,
            imageUrl: product.images?.[0] || "https://via.placeholder.com/200",
          })),
          totalAmount: products.reduce(
            (sum, product, index) =>
              sum + (product.price || 25.99) * (index + 1),
            0
          ),
          status: "pagado", // Para simular pago confirmado
          paymentMethod: "mercadopago",
          shippingInfo: {
            name: "Usuario de Prueba",
            email: "test@example.com",
            phone: "+54 11 1234-5678",
            address: "Av. Corrientes 1234",
            city: "Buenos Aires",
            postalCode: "1016",
          },
          paymentId: "test_payment_" + Date.now(),
          paymentDetails: {
            status: "approved",
            method: "credit_card",
            type: "test",
            lastUpdated: new Date(),
          },
        });

        await testOrder.save();

        console.log("✅ Orden de prueba creada:", testOrder._id);

        return NextResponse.json({
          success: true,
          message: "Orden de prueba creada exitosamente",
          orderId: testOrder._id.toString(),
          orderData: {
            id: testOrder._id.toString(),
            status: testOrder.status,
            totalAmount: testOrder.totalAmount,
            itemsCount: testOrder.items.length,
          },
        });
      }

      // 📧 TEST ORDER EMAILS
      case "test_order_emails": {
        const { orderId } = body;

        if (!orderId) {
          return NextResponse.json(
            { success: false, message: "orderId es requerido" },
            { status: 400 }
          );
        }

        const order = await Order.findById(orderId);
        if (!order) {
          return NextResponse.json(
            { success: false, message: "Orden no encontrada" },
            { status: 404 }
          );
        }

        const user = await User.findById(order.user);
        if (!user) {
          return NextResponse.json(
            { success: false, message: "Usuario no encontrado" },
            { status: 404 }
          );
        }

        console.log(`🧪 Probando emails para orden: ${orderId}`);

        const results = [];

        // Probar email al cliente (creación de orden)
        const customerResult = await sendOrderConfirmationToCustomer(
          order,
          user
        );
        results.push({
          type: "customer_order",
          success: customerResult.success,
          messageId: customerResult.messageId,
          error: customerResult.error,
          to: user.email,
        });

        // Probar email al admin (nueva orden)
        const adminResult = await sendNewOrderNotificationToAdmin(order, user);
        results.push({
          type: "admin_order",
          success: adminResult.success,
          messageId: adminResult.messageId,
          error: adminResult.error,
          to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        });

        // Probar emails de pago confirmado
        const customerPaymentResult = await sendPaymentConfirmationToCustomer(
          order,
          user
        );
        results.push({
          type: "customer_payment",
          success: customerPaymentResult.success,
          messageId: customerPaymentResult.messageId,
          error: customerPaymentResult.error,
          to: user.email,
        });

        const adminPaymentResult = await sendPaymentNotificationToAdmin(
          order,
          user
        );
        results.push({
          type: "admin_payment",
          success: adminPaymentResult.success,
          messageId: adminPaymentResult.messageId,
          error: adminPaymentResult.error,
          to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        });

        const allSuccessful = results.every((r) => r.success);

        return NextResponse.json({
          success: allSuccessful,
          message: allSuccessful
            ? "Prueba de emails completada exitosamente"
            : "Algunos emails fallaron",
          orderId: orderId,
          results: results,
          summary: {
            total: results.length,
            successful: results.filter((r) => r.success).length,
            failed: results.filter((r) => !r.success).length,
          },
        });
      }

      // 📨 RESEND EMAILS
      case "resend_emails": {
        const { orderId, emailType = "both" } = body;

        if (!orderId) {
          return NextResponse.json(
            { success: false, message: "orderId es requerido" },
            { status: 400 }
          );
        }

        const order = await Order.findById(orderId).populate("user");
        if (!order || !order.user) {
          return NextResponse.json(
            { success: false, message: "Orden o usuario no encontrado" },
            { status: 404 }
          );
        }

        console.log(
          `🔄 Reenviando emails para orden: ${orderId}, tipo: ${emailType}`
        );

        const emailTypes =
          emailType === "both" ? ["customer", "admin"] : [emailType];
        const result = await resendEmails(order, order.user, emailTypes);

        return NextResponse.json({
          success: result.success,
          message: result.success
            ? "Emails reenviados exitosamente"
            : "Error reenviando emails",
          results: result.results,
          orderData: result.orderData,
        });
      }

      default: {
        return NextResponse.json(
          { success: false, message: `Acción no reconocida: ${action}` },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error("❌ Error en API de pruebas:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "🧪 API de Pruebas de Emails",
    actions: [
      "test_connection - Probar configuración de email",
      "create_test_order - Crear orden de prueba",
      "test_order_emails - Probar envío de emails de una orden",
      "resend_emails - Reenviar emails de una orden",
    ],
    usage: "Enviar POST con { action: 'nombre_accion', ...params }",
  });
}
