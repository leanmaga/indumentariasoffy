import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutas que requieren autenticación de administrador
const adminRoutes = [
  "/admin",
  "/api/mercadopago/auth/link",
  "/api/mercadopago/auth/unlink",
  "/api/mercadopago/check-status",
];

// Rutas que requieren cualquier autenticación
const protectedRoutes = ["/dashboard", "/profile", "/checkout"];

// Rutas de API de NextAuth que NO deben ser interceptadas
const nextAuthApiRoutes = ["/api/auth"];

// Rutas de MercadoPago que NO requieren autenticación (webhooks, callbacks)
const publicMercadoPagoRoutes = [
  "/api/mercadopago/webhook",
  "/api/mercadopago/auth/callback",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // NUNCA interceptar rutas de NextAuth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // NUNCA interceptar rutas públicas de MercadoPago (webhooks, callbacks)
  if (publicMercadoPagoRoutes.some((route) => pathname.startsWith(route))) {
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
      // Para rutas API de admin, devolver 403
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          {
            error:
              "No autorizado. Solo administradores pueden acceder a esta funcionalidad.",
          },
          { status: 403 }
        );
      }

      // Para rutas de página, redirigir a la página principal
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Usuario autenticado y con permisos correctos, permitir acceso
    return NextResponse.next();
  } catch (error) {
    console.error("Error en middleware:", error);

    // Para rutas API, devolver error 500
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Error de autenticación" },
        { status: 500 }
      );
    }

    // Para rutas de página, redirigir al login en caso de error
    const signInUrl = new URL("/auth/login", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }
}

// Configurar en qué rutas se activa el middleware
export const config = {
  matcher: [
    // Excluir explícitamente rutas de autenticación y webhooks públicos
    "/((?!api/auth|auth/signin|auth/signout|auth/callback|auth/error|api/mercadopago/webhook|api/mercadopago/auth/callback).*)",
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/checkout/:path*",
    "/api/mercadopago/auth/link",
    "/api/mercadopago/auth/unlink",
    "/api/mercadopago/check-status",
  ],
};
