import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  // Note: Don't use adapter with CredentialsProvider - it uses JWT sessions
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('[AUTH] Authorize started', { email: credentials?.email });

        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing credentials');
          throw new Error("Invalid credentials");
        }

        console.log('[AUTH] Querying database for user');
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          console.log('[AUTH] User not found or no password');
          throw new Error("Invalid credentials");
        }

        console.log('[AUTH] Verifying password');
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.log('[AUTH] Invalid password');
          throw new Error("Invalid credentials");
        }

        console.log('[AUTH] Authorization successful', { userId: user.id });
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('[AUTH] JWT callback triggered', { hasUser: !!user, tokenId: token.id });
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      console.log('[AUTH] JWT callback completed');
      return token;
    },
    async session({ session, token }) {
      console.log('[AUTH] Session callback triggered', { hasToken: !!token, tokenId: token.id });
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      console.log('[AUTH] Session callback completed');
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug logging in production temporarily
};

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
