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
        console.log(
          `Orden duplicada detectada con clave ${orderData.idempotencyKey}. Devolviendo orden existente ${existingOrder._id}`
        );

        // Si la orden existente ya tiene información de pago de MercadoPago, devolverla
        if (orderData.paymentMethod === "mercadopago") {
          // Obtener la información de pago existente si ya fue creada antes
          // Aquí podrías implementar una función para recuperar datos de pago de MercadoPago
          // en lugar de crear una nueva preferencia

          // Este es un ejemplo simplificado. Lo ideal sería recuperar la preferencia existente
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

    if (similarOrder) {
      console.log(
        `Orden similar reciente encontrada: ${similarOrder._id}. Posible duplicado.`
      );

      // Opción 1: Considerar esto como un duplicado y devolver la orden existente
      // Aquí podrías habilitar esto para prevenir completamente los duplicados
      /*
      if (orderData.paymentMethod === "mercadopago") {
        const preferenceResponse = await createPaymentPreference(similarOrder);
        
        return NextResponse.json({
          message: "Orden existente recuperada",
          orderId: similarOrder._id,
          paymentInfo: {
            id: preferenceResponse.id,
            init_point: preferenceResponse.init_point,
            sandbox_init_point: preferenceResponse.sandbox_init_point,
          },
        });
      }
      
      return NextResponse.json({
        message: "Orden existente recuperada",
        orderId: similarOrder._id,
      });
      */

      // Opción 2: Registrar pero continuar (por si el usuario realmente quiere hacer otro pedido igual)
      console.log(
        "Continuando con la creación de la orden a pesar de la similitud"
      );
    }

    // Crear la orden en la base de datos
    const order = new Order({
      user: user._id,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      shippingInfo: orderData.shippingInfo,
      status: "pendiente",
      idempotencyKey: orderData.idempotencyKey, // Guardar la clave de idempotencia
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
        // Primero, asegúrate de que el campo exista en tu modelo
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
// Agregar este método al archivo existente api/orders/route.js

// GET - Obtener todas las órdenes (solo para admins)
export async function GET(request) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Verificar si es admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    // Conectar a la base de datos
    await connectDB();

    // Parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status");

    // Construir la consulta
    let query = {};
    if (status) {
      query.status = status;
    }

    // Obtener todas las órdenes con populate del usuario
    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Contar el total para paginación
    const total = await Order.countDocuments(query);

    // Agregar logs para depuración
    console.log(`Órdenes recuperadas para admin: ${orders.length}`);

    // Retornar las órdenes
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return NextResponse.json(
      { message: "Error al obtener órdenes" },
      { status: 500 }
    );
  }
}
