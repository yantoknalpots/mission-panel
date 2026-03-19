import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import "../styles/globals.css";

function AuthGuard({ children }) {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated" && router.pathname !== "/login") router.push("/login");
  }, [status, router]);
  if (router.pathname === "/login") return children;
  if (status === "loading") return <div className="min-h-screen flex items-center justify-center bg-surface-0"><div className="text-t-3 animate-pulse">Loading...</div></div>;
  if (status !== "authenticated") return null;
  return children;
}

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <AuthGuard><Component {...pageProps} /></AuthGuard>
    </SessionProvider>
  );
}
