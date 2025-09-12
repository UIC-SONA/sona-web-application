import {DefaultValues, Resolver} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

export enum Authority {
  ADMIN = "ADMIN",
  ADMINISTRATIVE = "ADMINISTRATIVE",
  MEDICAL_PROFESSIONAL = "MEDICAL_PROFESSIONAL",
  LEGAL_PROFESSIONAL = "LEGAL_PROFESSIONAL",
  USER = "USER",
}

export interface User {
  id: number;
  keycloakId: string;
  profilePicturePath: string;
  username: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  email: string;
  authorities: Authority[];
  hasProfilePicture: boolean;
}

export interface UserDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  authorities: Authority[];
  password: string | undefined;
}

export interface Users {
  [userId: number]: User;
}

export const authorities: Record<Authority, string> = {
  [Authority.ADMIN]: "Administrador",
  [Authority.ADMINISTRATIVE]: "Administrativo",
  [Authority.MEDICAL_PROFESSIONAL]: "Profesional Médico",
  [Authority.LEGAL_PROFESSIONAL]: "Profesional Legal",
  [Authority.USER]: "Usuario",
}

export function userResolver(entity?: User): Resolver<UserDto> {
  return zodResolver(z.object({
    
    username: z
    .string()
    .nonempty("El nombre de usuario es requerido"),
    
    firstName: z
    .string()
    .nonempty("El nombre es requerido"),
    
    lastName: z
    .string()
    .nonempty("El apellido es requerido"),
    
    email: z
    .email()
    .nonempty("El email es requerido"),
    
    authorities: z
    .array(z.enum(Authority))
    .min(1, "Al menos un rol es requerido"),
    
    password: entity
      ? z.string().optional()
      : z.string().nonempty("La contraseña es requerida"),
  }))
}

export function userDefaultValues(entity?: User): DefaultValues<UserDto> {
  return {
    username: entity?.username ?? "",
    firstName: entity?.firstName ?? "",
    lastName: entity?.lastName ?? "",
    email: entity?.email ?? "",
    authorities: entity?.authorities ?? [],
    password: undefined,
  }
}