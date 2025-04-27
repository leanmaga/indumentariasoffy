import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
// Cambia esta línea para importar desde tu archivo existente
import connectDB from "@/lib/db"; // En lugar de dbConnect
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

    // Conectar a la base de datos (usando tu función existente)
    await connectDB();

    // Resto del código...
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

    // Crear la orden en la base de datos
    const order = new Order({
      user: user._id,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      shippingInfo: orderData.shippingInfo,
      status: "pendiente",
    });

    await order.save();

    // Agregar la orden al usuario
    user.orders.push(order._id);
    await user.save();

    // Si el método de pago es MercadoPago, crear preferencia de pago
    if (orderData.paymentMethod === "mercadopago") {
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
