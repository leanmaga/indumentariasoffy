// app/api/auth/login/route.js
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db"; // Cambiado de @/lib/mongoose a @/lib/db
import User from "@/models/User";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validar datos de entrada
    if (!email || !password) {
      return Response.json(
        { message: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Buscar usuario
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return Response.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return Response.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Configurar cookie - await cookies() primero
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 día
    });

    // Enviar respuesta sin la contraseña
    const userObject = user.toObject();
    delete userObject.password;

    return Response.json({
      user: userObject,
      message: "Inicio de sesión exitoso",
    });
  } catch (error) {
    console.error("Error en login:", error);
    return Response.json(
      { message: "Error en el servidor", error: error.message },
      { status: 500 }
    );
  }
}
