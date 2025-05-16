// app/api/users/password/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

// PUT - Cambiar contraseña
export async function PUT(request) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener datos del body
    const { currentPassword, newPassword } = await request.json();

    // Validar datos
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Obtener el usuario con la contraseña
    const user = await User.findOne({ email: session.user.email }).select(
      "+password"
    );
    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si es una cuenta de Google
    if (user.googleAuth) {
      return NextResponse.json(
        {
          message:
            "No se puede cambiar la contraseña en cuentas vinculadas a Google",
        },
        { status: 400 }
      );
    }

    // Verificar contraseña actual
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Contraseña actual incorrecta" },
        { status: 400 }
      );
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    return NextResponse.json({
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json(
      { message: "Error al cambiar la contraseña" },
      { status: 500 }
    );
  }
}
