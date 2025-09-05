import axios, {AxiosInstance, InternalAxiosRequestConfig} from "axios";
import {authErrorMessages, ErrorDescriptions} from "@/lib/errors";
import {Session} from "next-auth";

const SERVER_URL = process.env.NEXT_PUBLIC_MAIN_SERVER_URL as string;

console.log("SERVER_URL: ", SERVER_URL);

export const client = axios.create({baseURL: SERVER_URL})

export function authenticatedClient(sessionGetter: () => Promise<Session | null>):AxiosInstance {
  async function getSession() {
    const session = await sessionGetter();
    if (!session) {
      throw ErrorDescriptions.create("Error de Autenticación", "No se ha iniciado sesión")
    }
    if (session.error) {
      throw ErrorDescriptions.create("Error de Autenticación", authErrorMessages[session.error])
    }
    return session;
  }
  async function accessTokenInterceptor(config: InternalAxiosRequestConfig) {
    const session = await getSession()
    config.headers.Authorization = `Bearer ${session.accessToken}`;
    return config;
  }
  const instance = axios.create({baseURL: SERVER_URL});
  instance.interceptors.request.use(accessTokenInterceptor, Promise.reject);
  return instance
}

declare module "axios" {
  
  interface AxiosRequestConfig {
    tenantId?: number;
  }
  
}
