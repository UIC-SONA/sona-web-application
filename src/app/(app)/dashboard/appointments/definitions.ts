import {User} from "@/app/(app)/dashboard/users/definitions";
import {CalendarDate, CalendarDateTime} from "@internationalized/date";

export interface Appointment {
  id: number;
  date: CalendarDate;
  hour: number;
  canceled: boolean;
  cancellationReason?: string;
  type: AppointmentType;
  professional: Omit<User, "authorities">;
  attendant: Omit<User, "authorities">;
  range: AppointmentsRange;
}

export enum AppointmentType {
  PRESENTIAL = 'PRESENTIAL',
  VIRTUAL = 'VIRTUAL',
}

export interface AppointmentsRange {
  from: CalendarDateTime;
  to: CalendarDateTime;
}

export const appoimentsType: Record<AppointmentType, string> = {
  [AppointmentType.PRESENTIAL]: 'Presencial',
  [AppointmentType.VIRTUAL]: 'Virtual',
}