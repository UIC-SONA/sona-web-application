import {authOptions} from "@/lib/auth"
import {getServerSession as getSession, Session} from "next-auth";
import {cookies, headers} from "next/headers";
import type {NextApiRequest, NextApiResponse} from "next";
import {parseSetCookie} from "next/dist/compiled/@edge-runtime/cookies";

interface SessionOptions {
  update?: boolean; // Opción para actualizar la sesión (opcional, por defecto false)
}

/**
 * Obtener la sesión actual del usuario
 * @param options - Opciones de configuración para obtener la sesión
 * @returns Promesa que resuelve a un objeto Session o null si no hay sesión
 **/
export async function getServerSession({update = false}: SessionOptions = {}): Promise<Session | null> {
  
  if (update) {
    // Si se solicita actualizar la sesión, creamos objetos req/res simulados
    // necesarios para manipular cookies en el servidor y de esta forma actualizar
    // la cookie de sesión
    const [req, res] = await mockReqRes();
    return await getSession(req, res, authOptions);
  }
  
  // Si no se necesita actualizar, simplemente obtenemos la sesión con las opciones de autenticación
  return await getSession(authOptions);
}

/**
 * Crea objetos de solicitud y respuesta simulados para manejar cookies de sesión
 * @returns Promesa que resuelve a una tupla de [NextApiRequest, NextApiResponse]
 */
async function mockReqRes(): Promise<[NextApiRequest, NextApiResponse]> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  
  // Creamos un objeto de solicitud simulado con los encabezados y cookies actuales
  const req = {
    headers: Object.fromEntries(headerStore), // Convertimos los encabezados a un objeto
    cookies: Object.fromEntries(cookieStore.getAll().map((c) => [c.name, c.value])), // Convertimos las cookies a un objeto
  } as NextApiRequest;
  
  // Creamos un objeto de respuesta simulado con métodos para manipular encabezados
  const res = {
    getHeader: (name: string) => headerStore.get(name),
    setHeader: (name: string, values: readonly string[]) => {
      if (name !== "Set-Cookie") return; // Solo procesamos encabezados "Set-Cookie"
      for (const value of values) {
        const setCookie = parseSetCookie(value);
        if (setCookie) {
          cookieStore.set(setCookie)
        }
      }
    },
  } as NextApiResponse;
  
  // Devolvemos los objetos req y res simulados
  return [req, res];
}