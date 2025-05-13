// app/api/auth/update-profile/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ message: "No autenticado" }, { status: 401 });
    }

    const { phone } = await request.json();

    if (!phone) {
      return Response.json(
        { message: "El teléfono es requerido" },
        { status: 400 }
      );
    }

    await connectDB();

    // Actualizar el usuario con el nuevo teléfono
    await User.findByIdAndUpdate(session.user.id, {
      $set: { phone },
    });

    return Response.json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return Response.json({ message: "Error del servidor" }, { status: 500 });
  }
}
