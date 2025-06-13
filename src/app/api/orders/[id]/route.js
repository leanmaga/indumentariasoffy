// src/app/api/orders/[id]/route.js - ACTUALIZADO CON EMAILS
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { getPaymentsByExternalReference } from "@/lib/mercadopago";
import { sendPaymentConfirmedEmails } from "@/lib/order-emails";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // ✅ CORRECTO: Await params antes de usar sus propiedades
    const { id: orderId } = await params;

    // Validar que el ID existe
    if (!orderId) {
      return NextResponse.json(
        { message: "ID de orden no proporcionado" },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Buscar la orden
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la orden pertenezca al usuario (a menos que sea admin)
    if (
      session.user.role !== "admin" &&
      order.user.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { message: "No autorizado para ver esta orden" },
        { status: 403 }
      );
    }

    // Si la orden tiene MercadoPago como método de pago, obtener detalles adicionales
    let paymentDetails = null;
    if (order.paymentMethod === "mercadopago" && order.paymentId) {
      try {
        const payments = await getPaymentsByExternalReference(
          order._id.toString()
        );
        if (payments && payments.length > 0) {
          paymentDetails = payments[0];
        }
      } catch (error) {
        console.error("Error al obtener detalles del pago:", error);
      }
    }

    return NextResponse.json({
      order: JSON.parse(JSON.stringify(order)),
      paymentDetails,
    });
  } catch (error) {
    console.error("Error al obtener orden:", error);
    return NextResponse.json(
      { message: "Error al obtener la orden: " + error.message },
      { status: 500 }
    );
  }
}

// PATCH para actualizar el estado de una orden (solo para admins) - ACTUALIZADO CON EMAILS
export async function PATCH(request, { params }) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const orderId = params.id;
    const data = await request.json();

    // Conectar a la base de datos
    await connectDB();

    // Buscar la orden con información del usuario
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Obtener el usuario para los emails
    const user = await User.findById(order.user);
    if (!user) {
      return NextResponse.json(
        { message: "Usuario de la orden no encontrado" },
        { status: 404 }
      );
    }

    // Guardar el estado anterior
    const previousStatus = order.status;
    let emailResults = null;

    // Actualizar el estado de la orden si se proporciona
    if (data.status) {
      // Validar que sea un estado permitido
      const validStatuses = [
        "whatsapp_pendiente",
        "pendiente",
        "pagado",
        "enviado",
        "entregado",
        "cancelado",
      ];

      if (!validStatuses.includes(data.status)) {
        return NextResponse.json(
          { message: "Estado no válido" },
          { status: 400 }
        );
      }

      order.status = data.status;

      // 🆕 ENVIAR EMAILS CUANDO EL ESTADO CAMBIA A "PAGADO"
      if (data.status === "pagado" && previousStatus !== "pagado") {
        try {
          emailResults = await sendPaymentConfirmedEmails(order, user);

          if (emailResults.success) {
            // Agregar información sobre los emails enviados
            order.paymentDetails = {
              ...order.paymentDetails,
              manualStatusChange: {
                timestamp: new Date(),
                changedBy: session.user.email,
                previousStatus,
                newStatus: data.status,
                emailsSent: emailResults.results,
              },
            };
          } else {
            console.error(
              "❌ Error enviando emails tras cambio manual:",
              emailResults
            );
          }
        } catch (emailError) {
          console.error(
            "❌ Error crítico enviando emails tras cambio manual:",
            emailError
          );
          // No fallar la actualización por errores de email
        }
      }
    }

    // Agregar información de auditoría
    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status: data.status || order.status,
      timestamp: new Date(),
      changedBy: session.user.email,
      previousStatus,
    });

    await order.save();

    // Preparar respuesta
    const response = {
      message: "Orden actualizada correctamente",
      order,
      statusChange: {
        previous: previousStatus,
        current: order.status,
        timestamp: new Date(),
      },
    };

    // Incluir resultados de email si se enviaron
    if (emailResults) {
      response.emailResults = emailResults;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error al actualizar la orden:", error);
    return NextResponse.json(
      { message: `Error al actualizar la orden: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    // ✅ AWAIT params
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { message: "ID de orden no proporcionado" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Solo permitir cancelar órdenes que no estén entregadas
    if (order.status === "entregado") {
      return NextResponse.json(
        { message: "No se puede cancelar una orden entregada" },
        { status: 400 }
      );
    }

    order.status = "cancelado";
    order.paymentDetails = {
      ...order.paymentDetails,
      cancelledBy: session.user.email,
      cancelledAt: new Date(),
      cancelledReason: "Cancelado por administrador",
    };

    await order.save();

    return NextResponse.json({
      message: "Orden cancelada correctamente",
      order,
    });
  } catch (error) {
    console.error("Error al cancelar la orden:", error);
    return NextResponse.json(
      { message: `Error al cancelar la orden: ${error.message}` },
      { status: 500 }
    );
  }
}
