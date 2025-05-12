// app/api/auth/me/route.js
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    // Obtener token de la cookie - AQUÍ ES DONDE FALTA EL AWAIT
    const cookieStore = await cookies(); // <- AÑADIR AWAIT AQUÍ
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json(
        {
          success: false,
          isAuthenticated: false,
          message: "No autenticado",
        },
        { status: 200 }
      );
    }

    // El resto de tu código sigue igual...
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return Response.json(
        {
          success: false,
          isAuthenticated: false,
          message: "Usuario no encontrado",
        },
        { status: 200 }
      );
    }

    return Response.json({
      success: true,
      isAuthenticated: true,
      user,
    });
  } catch (error) {
    console.error("Error en /api/auth/me:", error);
    return Response.json(
      {
        success: false,
        isAuthenticated: false,
        message: "Token inválido",
      },
      { status: 200 }
    );
  }
}
