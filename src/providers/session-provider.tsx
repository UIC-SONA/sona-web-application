"use client";

import {SessionProvider as NextAuthSessionProvider, useSession} from "next-auth/react";
import {PropsWithChildren, useEffect} from "react";
import {setCacheSession} from "@/lib/session-client";

export function SessionProvider({children}: Readonly<PropsWithChildren>) {
  return <NextAuthSessionProvider refetchInterval={60}>
    <SessionUpdater/>
    {children}
  </NextAuthSessionProvider>;
}

export function SessionUpdater() {
  const {data} = useSession();
  useEffect(() => {
    setCacheSession(data)
  }, [data]);
  return undefined;
}