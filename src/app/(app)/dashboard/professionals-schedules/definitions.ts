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
  fromHour: z.coerce.number().min(0).max(24) as z.ZodNumber,
  toHour: z.coerce.number().min(0).max(24) as z.ZodNumber,
  professionalId: z.number(),
});


export const scheduleSchema = scheduleSchemaBase.extend({
  date: z.instanceof(CalendarDate),
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

export const schedulesSchema = scheduleSchemaBase.extend({
  dates: z.array(z.instanceof(CalendarDate)),
});

export const schedulesResolver = zodResolver(schedulesSchema);

