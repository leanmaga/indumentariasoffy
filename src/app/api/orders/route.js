// src/app/api/orders/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { createPaymentPreference } from "@/lib/mercadopago";

export async function POST(request) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Conectar a la base de datos
    await connectDB();

    // Obtener el usuario
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Obtener datos del body
    const orderData = await request.json();

    // Verificar si existe una clave de idempotencia
    if (orderData.idempotencyKey) {
      // Buscar si ya existe una orden con esta clave de idempotencia
      const existingOrder = await Order.findOne({
        idempotencyKey: orderData.idempotencyKey,
      });

      // Si ya existe, devolver la información de esa orden
      if (existingOrder) {
        // Si la orden existente ya tiene información de pago de MercadoPago, devolverla
        if (orderData.paymentMethod === "mercadopago") {
          // Obtener la información de pago existente si ya fue creada antes
          const preferenceResponse = await createPaymentPreference(
            existingOrder
          );

          return NextResponse.json({
            message: "Orden existente recuperada",
            orderId: existingOrder._id,
            paymentInfo: {
              id: preferenceResponse.id,
              init_point: preferenceResponse.init_point,
              sandbox_init_point: preferenceResponse.sandbox_init_point,
            },
          });
        } else if (orderData.paymentMethod === "whatsapp") {
          // Para pedidos de WhatsApp, simplemente devolver el ID
          return NextResponse.json({
            message: "Orden de WhatsApp existente recuperada",
            orderId: existingOrder._id,
          });
        }

        return NextResponse.json({
          message: "Orden existente recuperada",
          orderId: existingOrder._id,
        });
      }
    }

    // Verificar si existe un pedido similar reciente (mismo total, mismos items)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const similarOrder = await Order.findOne({
      user: user._id,
      totalAmount: orderData.totalAmount,
      createdAt: { $gt: fiveMinutesAgo },
      status: "pendiente",
    });

    // Verificar si el método de pago es válido
    const validPaymentMethods = [
      "mercadopago",
      "credit_card",
      "debit_card",
      "whatsapp",
    ];
    if (!validPaymentMethods.includes(orderData.paymentMethod)) {
      return NextResponse.json(
        { message: "Método de pago no válido" },
        { status: 400 }
      );
    }

    // Determinar el estado inicial de la orden según el método de pago
    let initialStatus = "pendiente";
    if (orderData.paymentMethod === "whatsapp") {
      initialStatus = "whatsapp_pendiente";
    }

    // Crear la orden en la base de datos
    const order = new Order({
      user: user._id,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      shippingInfo: orderData.shippingInfo,
      status: initialStatus,
      idempotencyKey: orderData.idempotencyKey, // Guardar la clave de idempotencia
      whatsappOrder: orderData.paymentMethod === "whatsapp", // Flag para órdenes de WhatsApp
    });

    await order.save();

    // Agregar la orden al usuario
    user.orders.push(order._id);
    await user.save();

    // Si el método de pago es MercadoPago, crear preferencia de pago
    if (orderData.paymentMethod === "mercadopago") {
      try {
        const preferenceResponse = await createPaymentPreference(order);

        // Incluir ambas URLs, con prioridad al sandbox para entorno de prueba
        return NextResponse.json({
          message: "Orden creada correctamente",
          orderId: order._id,
          paymentInfo: {
            id: preferenceResponse.id,
            init_point: preferenceResponse.init_point,
            sandbox_init_point: preferenceResponse.sandbox_init_point,
          },
        });
      } catch (mpError) {
        console.error("Error al crear preferencia en MercadoPago:", mpError);

        // SOLUCIÓN: Usar "cancelado" en lugar de "error_pago"
        order.status = "cancelado"; // Estado permitido

        // Almacenar los detalles del error en un campo adicional
        order.paymentDetails = {
          errorType: "error_pago",
          errorMessage: mpError.message,
          errorTimestamp: new Date(),
        };
        await order.save();

        return NextResponse.json(
          { message: `Error al crear preferencia de pago: ${mpError.message}` },
          { status: 500 }
        );
      }
    } else if (orderData.paymentMethod === "whatsapp") {
      // Para pedidos de WhatsApp, simplemente devolver el ID de la orden
      return NextResponse.json({
        message: "Orden de WhatsApp creada correctamente",
        orderId: order._id,
      });
    }

    // Para otros métodos de pago
    return NextResponse.json({
      message: "Orden creada correctamente",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Error al crear la orden:", error);
    return NextResponse.json(
      { message: `Error al crear la orden: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Verificación de administrador
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    await connectDB();

    // Obtener todas las órdenes con populate
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    // Devolver DIRECTAMENTE el array (sin wrapper de objeto)
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return NextResponse.json([], { status: 500 }); // Devolver array vacío en caso de error
  }
}
