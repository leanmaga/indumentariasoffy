import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutas que requieren autenticación de administrador
const adminRoutes = ["/admin"];

// Rutas que requieren cualquier autenticación
const protectedRoutes = ["/dashboard", "/profile", "/checkout"];

// Rutas de API de NextAuth que NO deben ser interceptadas
const nextAuthApiRoutes = ["/api/auth"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // NUNCA interceptar rutas de NextAuth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Verificar si es una ruta administrativa o protegida
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Si no es una ruta protegida ni administrativa, permitir el acceso
  if (!isAdminRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  // Verificar el token solo para rutas protegidas
  try {
    // Obtener el token de la sesión (NextAuth.js)
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Si no hay token, redirigir al login
    if (!token) {
      const signInUrl = new URL("/auth/login", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Si es una ruta de administrador, verificar el rol
    if (isAdminRoute && token.role !== "admin") {
      // Redirigir a la página principal si no es administrador
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Usuario autenticado y con permisos correctos, permitir acceso
    return NextResponse.next();
  } catch (error) {
    console.error("Error en middleware:", error);
    // En caso de error, permitir el acceso para evitar bloqueos
    return NextResponse.next();
  }
}

// Configurar en qué rutas se activa el middleware
export const config = {
  matcher: [
    // Excluir explícitamente rutas de autenticación
    "/((?!api/auth|auth/signin|auth/signout|auth/callback|auth/error).*)",
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/checkout/:path*",
  ],
};
