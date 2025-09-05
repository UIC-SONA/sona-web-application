import * as z from "zod";
import {DefaultValues} from "react-hook-form";

export type LoginData = z.infer<typeof loginSchema>;

export const loginSchema = z.object({
  username: z
  .string({error: "Usuario o correo electrónico es requerido"})
  .nonempty("Usuario o correo electrónico es requerido"),
  
  password: z
  .string({error: "Contraseña es requerida"})
  .nonempty("Contraseña es requerida")
});


export const loginDefaultValues: DefaultValues<LoginData> = {
  username: "",
  password: "",
};