// SERVER
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET as string;
export const KEYCLOAK_ID = process.env.KEYCLOAK_ID as string;
export const KEYCLOAK_SECRET = process.env.KEYCLOAK_SECRET as string;
export const KEYCLOAK_ISSUER = process.env.KEYCLOAK_ISSUER as string;
// CLIENT
export const MAIN_SERVER_URL = process.env.NEXT_PUBLIC_MAIN_SERVER_URL as string;