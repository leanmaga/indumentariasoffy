import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { createPaymentPreference } from "@/lib/mercadopago";

// GET - Obtener las órdenes del usuario o todas las órdenes (para admin)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    await connectDB();

    let orders;

    // Si es admin, obtener todas las órdenes, sino solo las del usuario
    if (session.user.role === "admin") {
      orders = await Order.find()
        .populate("user", "name email phone")
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ user: session.user.id }).sort({
        createdAt: -1,
      });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return NextResponse.json(
      { message: "Error al obtener las órdenes" },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva orden
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const { items, totalAmount, shippingInfo, paymentMethod } =
      await request.json();

    // Validaciones
    if (
      !items ||
      !items.length ||
      !totalAmount ||
      !shippingInfo ||
      !paymentMethod
    ) {
      return NextResponse.json(
        { message: "Datos incompletos" },
        { status: 400 }
      );
    }

    await connectDB();

    // Crear nueva orden
    const newOrder = new Order({
      user: session.user.id,
      items,
      totalAmount,
      paymentMethod,
      shippingInfo,
      status: "pendiente",
    });

    await newOrder.save();

    // Agregar la orden al usuario
    await User.findByIdAndUpdate(session.user.id, {
      $push: { orders: newOrder._id },
    });

    // Si el método de pago es MercadoPago, crear preferencia de pago
    let paymentPreference = null;
    if (paymentMethod === "mercadopago") {
      paymentPreference = await createPaymentPreference(newOrder);
    }

    return NextResponse.json(
      {
        message: "Orden creada correctamente",
        order: newOrder,
        paymentInfo: paymentPreference,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear orden:", error);
    return NextResponse.json(
      { message: "Error al crear la orden" },
      { status: 500 }
    );
  }
}
