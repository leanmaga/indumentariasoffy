// app/api/users/profile/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

// Importa el modelo Order correctamente
import Order from "@/models/Order";

// GET - Obtener perfil del usuario
export async function GET(request) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Conectar a la base de datos
    await connectDB();

    // Obtener el usuario sin populate para evitar problemas
    const user = await User.findOne({ email: session.user.email }).select(
      "-password"
    );

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Obtener las órdenes por separado si el usuario no es admin
    let userData = JSON.parse(JSON.stringify(user));

    if (user.role !== "admin" && user.orders && user.orders.length > 0) {
      try {
        // Obtener las últimas 3 órdenes
        const recentOrders = await Order.find({ _id: { $in: user.orders } })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean();

        // Añadir órdenes recientes al objeto de usuario
        userData.recentOrders = recentOrders;
      } catch (orderError) {
        console.error("Error al obtener órdenes:", orderError);
        // No fallamos toda la solicitud si solo hay un error con las órdenes
      }
    }

    // Devolver el perfil del usuario
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json(
      { message: "Error al obtener el perfil: " + error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar perfil del usuario
export async function PUT(request) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener datos del body
    const data = await request.json();

    // Validar datos
    if (!data.name || !data.email) {
      return NextResponse.json(
        { message: "Nombre y correo electrónico son requeridos" },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Verificar si el correo ya está en uso (si se está cambiando)
    if (data.email !== session.user.email) {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        return NextResponse.json(
          { message: "Este correo electrónico ya está en uso" },
          { status: 400 }
        );
      }
    }

    // Obtener el usuario
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar datos
    user.name = data.name;
    user.email = data.email;
    if (data.phone) user.phone = data.phone;

    // Guardar cambios
    await user.save();

    // Devolver usuario actualizado
    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
      googleAuth: user.googleAuth,
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json(
      { message: "Error al actualizar el perfil" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar cuenta de usuario
export async function DELETE(request) {
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

    // Verificar que no sea el último administrador
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return NextResponse.json(
          { message: "No se puede eliminar el último administrador" },
          { status: 400 }
        );
      }
    }

    // Eliminar usuario
    await User.deleteOne({ _id: user._id });

    return NextResponse.json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar cuenta:", error);
    return NextResponse.json(
      { message: "Error al eliminar la cuenta" },
      { status: 500 }
    );
  }
}
