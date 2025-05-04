// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validar que se proporcionaron credenciales
          if (!credentials?.email || !credentials?.password) {
            console.log("Credenciales faltantes");
            throw new Error("Por favor proporciona email y contraseña");
          }

          await connectDB();

          // Buscar usuario con contraseña incluida
          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          );

          if (!user) {
            console.log("Usuario no encontrado:", credentials.email);
            throw new Error("Credenciales incorrectas");
          }

          // Verificar que el usuario tiene contraseña
          if (!user.password) {
            console.log("Usuario sin contraseña:", user.email);
            throw new Error("Usuario no tiene contraseña configurada");
          }

          console.log("Intentando comparar contraseña para:", user.email);
          console.log("Contraseña hasheada existe:", !!user.password);

          // Comparar contraseña
          const isValid = await user.comparePassword(credentials.password);

          console.log("Resultado de comparación:", isValid);

          if (!isValid) {
            throw new Error("Credenciales incorrectas");
          }

          // Retornar datos del usuario (sin contraseña)
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "user",
            phone: user.phone,
          };
        } catch (error) {
          console.error("Error de autenticación completo:", error);
          throw new Error(error.message || "Error de autenticación");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
