import NextAuth from "next-auth";
import Google from "@auth/core/providers/google";

const ALLOWED_EMAILS = [
  "majovillama@gmail.com",
  "xavieeee@gmail.com",
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return ALLOWED_EMAILS.includes(user.email ?? "");
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
