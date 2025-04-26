import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutas que requieren autenticación de administrador
const adminRoutes = ["/admin"];

// Rutas que requieren cualquier autenticación
const protectedRoutes = ["/dashboard", "/profile", "/checkout"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Verificar si es una ruta administrativa o protegida
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Si no es una ruta protegida ni administrativa, permitir el acceso
  if (!isAdminRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  // Obtener el token de la sesión (NextAuth.js)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Si no hay token, redirigir al login
  if (!token) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Si es una ruta de administrador, verificar el rol
  if (isAdminRoute && token.role !== "admin") {
    // Redirigir a la página principal si no es administrador
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Usuario autenticado y con permisos correctos, permitir acceso
  return NextResponse.next();
}

// Configurar en qué rutas se activa el middleware
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/checkout/:path*",
  ],
};
