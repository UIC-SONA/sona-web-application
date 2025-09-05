import {Session} from "next-auth";
import {getSession} from "next-auth/react";

let cachedSession: Session | null = null;

export async function getCachedSession() {
  if (cachedSession) {
    const accessTokenExpiry = cachedSession.expires as number;
    if (Date.now() < accessTokenExpiry) {
      return cachedSession; // El token de acceso sigue siendo válido
    }
  }
  return await getSession();
}

export function setCacheSession(session: Session | null | undefined): void {
  cachedSession = session || null;
}