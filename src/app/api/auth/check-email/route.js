import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  try {
    // Obtener el email de los parámetros de consulta
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return Response.json(
        { message: "Se requiere un correo electrónico" },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Verificar si existe un usuario con ese email
    const user = await User.findOne({ email });

    // Si el usuario existe, verificar si está asociado a Google
    if (user) {
      return Response.json({
        exists: true,
        googleAuth: !!user.googleAuth, // Convertir a booleano explícito
        message: user.googleAuth
          ? "Este correo ya está registrado con Google. Inicia sesión usando Google."
          : "Este correo ya está registrado. Usa tu contraseña para iniciar sesión.",
      });
    }

    // Si no existe el usuario
    return Response.json({
      exists: false,
      googleAuth: false,
      message: "Correo electrónico disponible para registro.",
    });
  } catch (error) {
    console.error("Error al verificar email:", error);
    return Response.json(
      {
        message: "Error del servidor",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { message: "Se requiere un correo electrónico" },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Verificar si el correo ya está registrado
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Si el usuario ya existe, verificar si usa Google Auth
      return Response.json({
        exists: true,
        googleAuth: !!existingUser.googleAuth,
        message: existingUser.googleAuth
          ? "Esta cuenta ya existe y usa Google para iniciar sesión"
          : "Esta cuenta ya existe con email y contraseña",
      });
    }

    // Si el usuario no existe
    return Response.json({
      exists: false,
      message: "El correo electrónico está disponible",
    });
  } catch (error) {
    console.error("Error al verificar email:", error);
    return Response.json({ message: "Error del servidor" }, { status: 500 });
  }
}
