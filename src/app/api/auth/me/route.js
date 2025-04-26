import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    // Obtener token de la cookie
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "No autenticado" }, { status: 401 });
    }

    // Verificar token
    try {
      const decoded = verify(
        token,
        process.env.JWT_SECRET || "tu_secreto_temporal_reemplazar_en_produccion"
      );

      // Conectar a la base de datos
      await connectDB();

      // Buscar usuario en la base de datos
      const user = await User.findById(decoded.userId);

      if (!user) {
        return Response.json(
          { message: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      // Devolver información del usuario
      return Response.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || "user",
          phone: user.phone,
        },
      });
    } catch (error) {
      console.error("Error al verificar token:", error);
      return Response.json({ message: "Token inválido" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return Response.json({ message: "Error del servidor" }, { status: 500 });
  }
}
