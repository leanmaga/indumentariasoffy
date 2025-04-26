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

    // Devolver resultado (true si existe, false si no)
    return Response.json({ exists: !!user });
  } catch (error) {
    console.error("Error al verificar email:", error);
    return Response.json({ message: "Error del servidor" }, { status: 500 });
  }
}
