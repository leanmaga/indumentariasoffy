// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/email-actions";

export async function POST(request) {
  try {
    const { name, email, password, phone } = await request.json();

    // Validaciones básicas
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Si el usuario existe con Google Auth pero sin contraseña
      if (existingUser.googleAuth && !existingUser.password) {
        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Actualizar el usuario con la contraseña y teléfono
        await User.findByIdAndUpdate(existingUser._id, {
          $set: {
            password: hashedPassword,
            phone: phone,
          },
        });

        return NextResponse.json({
          message: "Información actualizada correctamente",
          user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
          },
        });
      } else {
        // Usuario ya existe con credenciales completas
        return NextResponse.json(
          { message: "El usuario ya existe" },
          { status: 400 }
        );
      }
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo usuario (sin verificar inicialmente)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "user",
      isVerified: false, // Usuario no verificado por defecto
    });

    // Enviar email de verificación utilizando nuestra función mejorada
    const emailResult = await sendVerificationEmail(email);

    if (!emailResult.success) {
      console.error(
        "Error al enviar email de verificación:",
        emailResult.error
      );
      // Continuamos con el registro aunque falle el email
    }

    return NextResponse.json({
      message:
        "Usuario registrado correctamente. Por favor, verifica tu correo electrónico.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { message: "Error al registrar el usuario", error: error.message },
      { status: 500 }
    );
  }
}
