import {restRead} from "@/lib/rest-crud";
import {client} from "@/lib/http/axios-client";
import {Appointment, AppointmentsRange} from "@/app/(app)/dashboard/appointments/definitions";
import {CalendarDate, parseDate, parseDateTime} from "@internationalized/date";

/* eslint-disable  @typescript-eslint/no-explicit-any */
function entityConverter(appointment: any): Appointment {
  return {
    ...appointment,
    date: parseDate(appointment.date),
    range: rangeConverter(appointment.range),
  };
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
function rangeConverter(range: any): AppointmentsRange {
  return {
    from: parseDateTime(range.from),
    to: parseDateTime(range.to),
  };
}


const resource = '/appointment';

const read = restRead(client, resource, {
  entityConverter
})

export const findAppointmentAction = read.find;
export const pageAppointmentsAction = read.page;

export const findAppointmentsRangesByProfessionalAction = async (professionalId: number, from: CalendarDate, to: CalendarDate) => {
  const response = await client.get<[]>(
    `${resource}/professional/${professionalId}/ranges`,
    {
      params: {
        from: from.toString(),
        to: to.toString(),
      },
    }
  );
  return response.data.map(rangeConverter);
};