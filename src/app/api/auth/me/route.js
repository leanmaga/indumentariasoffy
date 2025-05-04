// app/api/auth/me/route.js
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db"; // Cambiado de @/lib/mongoose a @/lib/db
import User from "@/models/User";

export async function GET() {
  try {
    // Obtener token de la cookie - await cookies() primero
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return Response.json({ message: "No autenticado" }, { status: 401 });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario
    await connectDB();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return Response.json(
        { message: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    return Response.json({ user });
  } catch (error) {
    console.error("Error en /api/auth/me:", error);
    return Response.json({ message: "Token inválido" }, { status: 401 });
  }
}
