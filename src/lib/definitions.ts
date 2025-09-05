import {PasswordRules} from "@/components/ui/password-strength-indicator";

export interface Option<T> {
  value: T;
  label: string;
}

export interface CommonOption extends Option<string> {
  [key: string]: string | boolean | undefined
}

export interface EnumMatch<V> {
  [k: string]: V;
}

export interface SessionUser {
  id: string;
  roles: `ROLE_${string}`[];
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Auditable {
  createdBy?: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate: string;
}

export const passwordRules: PasswordRules = [
  {expr: password => password.length >= 8, message: "La contraseña debe tener al menos 8 caracteres"},
  {expr: /[A-Z]/, message: "Debe contener al menos una mayúscula"},
  {expr: /\d/, message: "Debe contener al menos un número"},
  {expr: /[^A-Za-z0-9]/, message: "Debe contener al menos un carácter especial"},
]

