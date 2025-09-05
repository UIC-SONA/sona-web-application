import {JWT} from "next-auth/jwt";

export interface GuardPath {
  paths: string[] | string;
  redirect: string;
}

export interface AuthenticatedGuardPath extends GuardPath {
  authorized?: (token: JWT) => boolean;
}

export interface Guards {
  // Rutas accesibles solo para usuarios no autenticados
  guestOnly: GuardPath[];
  // Rutas accesibles solo para usuarios autenticados (Opcionalmente se puede validar autoridades/roles)
  authenticated: AuthenticatedGuardPath[];
}

export const guards: Guards = {
  guestOnly: [
    {
      paths: [
        "/sign-in",
        "/sign-up",
        "/forgot-password",
      ],
      redirect: "/dashboard",
    }
  ],
  authenticated: [
    {
      paths: [
        "/",
        "/dashboard",
        "/profile",
        "/settings",
      ],
      redirect: "/sign-in",
    }
  ],
};
