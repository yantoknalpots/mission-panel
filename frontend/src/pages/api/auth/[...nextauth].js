import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Mission Control",
      credentials: { username: {}, password: {} },
      async authorize(creds) {
        if (creds.username === "admin" && creds.password === "Yantoknalpots123!")
          return { id: "1", name: "Admin" };
        return null;
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 7 * 24 * 3600 },
  secret: "mc-secret-openclaw-2026",
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
});
