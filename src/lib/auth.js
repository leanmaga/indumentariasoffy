// lib/auth.js
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
// Removemos el adaptador de MongoDB que está causando problemas
// import { MongoDBAdapter } from "@auth/mongodb-adapter";
import connectDB from "./db";
import User from "@/models/User";

export const authOptions = {
  // Eliminamos el adaptador que está causando el error
  // adapter: MongoDBAdapter(...),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "user", // Por defecto
          phone: "",
        };
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();

        try {
          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          );

          if (!user || !(await user.comparePassword(credentials.password))) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          };
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "credentials") {
        return true;
      }

      if (account.provider === "google") {
        try {
          await connectDB();

          // Buscar usuario existente por email
          const existingUser = await User.findOne({ email: profile.email });

          if (existingUser) {
            // Actualizar el usuario existente para habilitar Google Auth
            await User.findByIdAndUpdate(existingUser._id, {
              $set: {
                googleAuth: true,
                image: profile.picture || existingUser.image,
              },
            });

            // Añadir bandera para CheckoutPage si no tiene teléfono configurado
            if (!existingUser.phone) {
              user.needsPhoneUpdate = true;
            }

            // Asignar el ID y rol existentes al usuario de la sesión
            user.id = existingUser._id.toString();
            user.role = existingUser.role;
            user.phone = existingUser.phone || "";

            return true;
          } else {
            // Si no existe, crear un nuevo usuario
            const newUser = await User.create({
              name: profile.name,
              email: profile.email,
              phone: "",
              role: "user", // Rol por defecto
              googleAuth: true,
              image: profile.picture,
            });

            // Indicar que necesita actualización de teléfono
            user.id = newUser._id.toString();
            user.role = newUser.role;
            user.phone = "";
            user.needsPhoneUpdate = true;

            return true;
          }
        } catch (error) {
          console.error("Error en signIn callback:", error);
          return false;
        }
      }

      return false; // Rechazar otros proveedores
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone || "";

        if (account?.provider === "google") {
          token.googleAuth = true;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone || "";
        session.user.googleAuth = token.googleAuth || false;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default authOptions;
