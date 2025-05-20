// app/api/debug/register-test/route.js (elimínala después)
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectDB();
    
    // Datos de prueba
    const email = "test@prueba.com";
    const password = "123456";
    
    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    
    if (user) {
      // Actualizar contraseña existente
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      user.password = hashedPassword;
      await user.save();
      
      return NextResponse.json({
        message: "Usuario de prueba actualizado",
        email,
        passwordUpdated: true
      });
    }
    
    // Crear usuario de prueba
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user = await User.create({
      name: "Usuario de Prueba",
      email,
      password: hashedPassword,
      phone: "1234567890",
      role: "user",
      isVerified: true // Marcarlo como verificado para pruebas
    });
    
    return NextResponse.json({
      message: "Usuario de prueba creado",
      email,
      passwordSet: true
    });
  } catch (error) {
    console.error("Error creando usuario de prueba:", error);
    return NextResponse.json(
      { message: "Error en la creación", error: error.message },
      { status: 500 }
    );
  }
}