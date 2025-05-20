// app/api/debug/password/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

// IMPORTANTE: Elimina este endpoint en producción
export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Buscar usuario con password incluido
    const user = await User.findOne({ email }).select("+password");
    
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    
    // Información de diagnóstico (sin mostrar la contraseña real)
    const diagnosticInfo = {
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      passwordStartsWith: user.password ? user.password.substring(0, 10) + "..." : "",
      isVerified: user.isVerified,
      isGoogleAccount: user.googleAuth
    };
    
    // Probar comparación directa con bcrypt
    let bcryptResult = null;
    try {
      if (user.password) {
        bcryptResult = await bcrypt.compare(password, user.password);
      }
    } catch (bcryptError) {
      return NextResponse.json({
        error: "Error en comparación bcrypt",
        message: bcryptError.message,
        diagnosticInfo
      }, { status: 500 });
    }
    
    // Probar el método comparePassword del modelo
    let modelMethodResult = null;
    try {
      if (typeof user.comparePassword === 'function') {
        modelMethodResult = await user.comparePassword(password);
      }
    } catch (methodError) {
      return NextResponse.json({
        error: "Error en método comparePassword",
        message: methodError.message,
        diagnosticInfo,
        bcryptResult
      }, { status: 500 });
    }
    
    return NextResponse.json({
      message: "Diagnóstico completado",
      diagnosticInfo,
      bcryptResult,
      modelMethodResult
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error del servidor", message: error.message },
      { status: 500 }
    );
  }
}