import axios, {AxiosInstance, InternalAxiosRequestConfig} from "axios";
import {authErrorMessages, ErrorDescriptions} from "@/lib/errors";
import {Session} from "next-auth";
import {MAIN_SERVER_URL} from "@/constants";


export const client = axios.create({baseURL: MAIN_SERVER_URL})

export function authenticatedClient(sessionGetter: () => Promise<Session | null>): AxiosInstance {
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
  
  const instance = axios.create({baseURL: MAIN_SERVER_URL});
  instance.interceptors.request.use(accessTokenInterceptor, Promise.reject);
  return instance
}