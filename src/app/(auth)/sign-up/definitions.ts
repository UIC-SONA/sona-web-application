import * as z from "zod";
import {DefaultValues} from "react-hook-form";

export type SignupData = z.infer<typeof signupSchema>;

export const signupSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  email: z.email("Correo electrónico inválido"),
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  repeatPassword: z.string()
}).refine((data) => data.password === data.repeatPassword, {
  message: "Las contraseñas no coinciden",
  path: ["repeatPassword"],
});

export const singupDefaultValues: DefaultValues<SignupData> = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  repeatPassword: "",
}
