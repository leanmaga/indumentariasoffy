import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    const { name, email, password, phone } = await request.json();

    // Validar datos
    if (!name || !email || !password || !phone) {
      return Response.json(
        { message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar formato de correo electrónico
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { message: "Formato de correo electrónico inválido" },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return Response.json(
        { message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Verificar si el correo ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { message: "El correo electrónico ya está registrado" },
        { status: 409 }
      );
    }

    // Crear nuevo usuario
    const newUser = new User({
      name,
      email,
      password,
      phone,
    });

    // Guardar usuario en la base de datos
    await newUser.save();

    // Enviar respuesta exitosa
    return Response.json(
      { message: "Usuario registrado con éxito" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return Response.json({ message: "Error del servidor" }, { status: 500 });
  }
}
