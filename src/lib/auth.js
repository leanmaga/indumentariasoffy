import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "./db";
import User from "@/models/User";

export const authOptions /**: NextAuthOptions */ = {
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
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await User.findOne({ email: credentials.email }).select(
          "+password"
        );
        if (!user || !(await user.comparePassword(credentials.password)))
          return null;
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (
        url.startsWith(baseUrl) ||
        url.startsWith("/") ||
        url.includes(baseUrl)
      )
        return url;
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          await connectDB();
          const existing = await User.findOne({ email: profile.email });
          if (existing) {
            await User.findByIdAndUpdate(existing._id, {
              googleAuth: true,
              image: profile.picture,
            });
            user.id = existing._id.toString();
            user.role = existing.role;
            user.phone = existing.phone;
            return true;
          }
          const newUser = await User.create({
            name: profile.name,
            email: profile.email,
            role: "user",
            googleAuth: true,
            image: profile.picture,
          });
          user.id = newUser._id.toString();
          user.role = newUser.role;
          user.phone = newUser.phone;
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        if (account?.provider === "google") token.googleAuth = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
        session.user.googleAuth = token.googleAuth || false;
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
};
export default authOptions;
