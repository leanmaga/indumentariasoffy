import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "user",
          phone: "",
          isVerified: true, // Usuarios de Google se consideran verificados automáticamente
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
        try {
          // Check if credentials are provided
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Connect to database
          await connectDB();

          // Find user by email
          let user = await User.findOne({ email: credentials.email });

          // If no user found
          if (!user) {
            return null;
          }

          // Recargar el usuario CON password
          user = await User.findById(user._id).select("+password");

          // Check if user is Google-only account without password
          if (user.googleAuth && !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Comprobar si el usuario está verificado
          if (!user.isVerified && !user.googleAuth) {
            // Devolver un objeto especial para indicar que el usuario no está verificado
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              phone: user.phone || "",
              role: user.role || "user",
              isVerified: false,
              notVerified: true, // Campo especial para manejar en el cliente
            };
          }

          // Return user data
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            role: user.role || "user",
            isVerified: user.isVerified || false,
          };
        } catch (error) {
          console.error("ERROR GENERAL en NextAuth authorize:", error);
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
    async redirect({ url, baseUrl }) {
      if (
        url.startsWith(baseUrl) ||
        url.startsWith("/") ||
        url.includes(baseUrl)
      ) {
        return url;
      }
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      // Google sign-in handling
      if (account.provider === "google") {
        try {
          await connectDB();
          const existing = await User.findOne({ email: profile.email });

          if (existing) {
            // Update existing user with Google info
            await User.findByIdAndUpdate(existing._id, {
              googleAuth: true,
              image: profile.picture,
              isVerified: true, // Al usar Google, marcamos como verificado
            });

            user.id = existing._id.toString();
            user.role = existing.role;
            user.phone = existing.phone || "";
            user.isVerified = true;
            return true;
          }

          // Create new user for Google login
          const newUser = await User.create({
            name: profile.name,
            email: profile.email,
            role: "user",
            googleAuth: true,
            image: profile.picture,
            isVerified: true, // Al usar Google, marcamos como verificado
          });

          user.id = newUser._id.toString();
          user.role = newUser.role;
          user.phone = newUser.phone || "";
          user.isVerified = true;
          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      } else if (account.provider === "credentials") {
        // Si el usuario tiene el flag notVerified, rechazar el inicio de sesión
        if (user.notVerified) {
          throw new Error(
            "Usuario no verificado. Por favor verifica tu correo electrónico."
          );
        }
        return true;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
        token.phone = user.phone || "";
        token.isVerified = user.isVerified || false; // Guardar en el token si está verificado

        if (account?.provider === "google") {
          token.googleAuth = true;
          token.isVerified = true; // Los usuarios de Google siempre se consideran verificados
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role || "user";
        session.user.phone = token.phone || "";
        session.user.googleAuth = token.googleAuth || false;
        session.user.isVerified = token.isVerified || false; // Incluir en la sesión
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
};

export default authOptions;
