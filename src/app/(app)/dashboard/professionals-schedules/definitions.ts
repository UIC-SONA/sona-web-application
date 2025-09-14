import {User} from "@/app/(app)/dashboard/users/definitions";
import {CalendarDate} from "@internationalized/date";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {DefaultValues, Resolver} from "react-hook-form";

export interface ProfessionalSchedule {
  id: number;
  date: CalendarDate;
  fromHour: number;
  toHour: number;
  professional: User;
}

export interface ProfessionalScheduleDtoBase {
  fromHour: number;
  toHour: number;
  professionalId: number;
}

export interface ProfessionalScheduleDto extends ProfessionalScheduleDtoBase {
  date: CalendarDate;
}

export interface ProfessionalSchedulesDto extends ProfessionalScheduleDtoBase {
  dates: CalendarDate[];
}

export const scheduleSchemaBase = z.object({
  
  fromHour: z
  .coerce
  .number({error: "La hora de inicio debe ser un número"})
  .min(0, {error: "La hora de inicio debe ser mayor o igual a 0"})
  .max(24, {error: "La hora de inicio debe ser menor o igual a 24"}) as z.ZodNumber,
  
  toHour: z
  .coerce
  .number({error: "La hora de fin debe ser un número"})
  .min(0, {error: "La hora de fin debe ser mayor o igual a 0"})
  .max(24, {error: "La hora de fin debe ser menor o igual a 24"}) as z.ZodNumber,
  
  professionalId: z
  .number({error: "El profesional es obligatorio"})
  .positive({error: "El profesional es obligatorio"})
  
}).refine((data) => data.toHour > data.fromHour, {
  message: "La hora de fin debe ser mayor a la hora de inicio",
  path: ["toHour"],
});


export const scheduleSchema = scheduleSchemaBase.safeExtend({
  
  date: z
  .instanceof(CalendarDate, {error: "La fecha es obligatoria"})
  
});

export function scheduleResolver(): Resolver<ProfessionalScheduleDto> {
  return zodResolver(scheduleSchema);
}

export function scheduleDefaultValues(entity?: ProfessionalSchedule): DefaultValues<ProfessionalScheduleDto> {
  return {
    date: entity?.date || new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()),
    fromHour: entity?.fromHour || 8,
    toHour: entity?.toHour || 18,
    professionalId: entity?.professional.id || 0,
  };
}

export const schedulesSchema = scheduleSchemaBase.safeExtend({
  
  dates: z
  .array(z.instanceof(CalendarDate, {error: "La fecha es obligatoria"}), {error: "Debe seleccionar al menos una fecha"})
  .min(1, {error: "Debe seleccionar al menos una fecha"})
  
});

export const schedulesResolver = zodResolver(schedulesSchema);

