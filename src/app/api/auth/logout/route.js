// // app/api/auth/logout/route.js
// import { cookies } from "next/headers";

// export async function POST() {
//   try {
//     // Eliminar cookie - await cookies() primero
//     const cookieStore = await cookies();
//     cookieStore.set("auth_token", "", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       expires: new Date(0),
//     });

//     return Response.json({ message: "Sesión cerrada correctamente" });
//   } catch (error) {
//     console.error("Error en logout:", error);
//     return Response.json(
//       { message: "Error al cerrar sesión" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Eliminar la cookie de autenticación
  cookies().delete("auth_token");

  return NextResponse.json({ success: true });
}
