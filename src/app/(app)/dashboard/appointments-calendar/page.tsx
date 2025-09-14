"use client"
import {PropsWithChildren, useEffect, useRef, useState} from "react";
import FullCalendarController from "@/components/calendar/full-calendar-controller";
import {Card, CardContent} from "@/components/ui/card";
import FullCalendarImproved from "@/components/calendar/full-calendar-improved";
import FullCalendar from "@fullcalendar/react";
import {EraserIcon, LoaderCircle} from "lucide-react";
import {cn} from "@/lib/utils";
import {EventInput} from "@fullcalendar/core";
import {Button} from "@/components/ui/button";
import {Appointment} from "@/app/(app)/dashboard/appointments/definitions";
import {Authority, User} from "@/app/(app)/dashboard/users/definitions";
import {useSession} from "next-auth/react";
import {ComboboxQuery, fromPage} from "@/components/ui/combobox";
import {pageUsersAction} from "@/app/(app)/dashboard/users/actions";
import {ZONE_ID} from "@/constants";
import AppointmentModal from "@/app/(app)/dashboard/appointments/_components/appointment-modal";
import {CalendarDate, now} from "@internationalized/date";
import {SelectAppointmentType} from "@/app/(app)/dashboard/appointments/_components/select-appointment-type";
import {Checkbox} from "@/components/ui/checkbox";
import {useAppointments} from "@/app/(app)/dashboard/appointments/_hooks/use-appointments";


export default function Page() {
  
  const calendarRef = useRef<FullCalendar | null>(null);
  const session = useSession();
  
  const [events, setEvents] = useState<EventInput[]>([]);
  const {query, filters} = useAppointments();
  
  const authorities = session.data?.authorities;
  const hasPrivileges = authorities?.some(a => ['ROLE_admin', 'ROLE_administrative'].includes(a));
  
  useEffect(() => {
    setEvents(toEventsInputs(query.data || [], hasPrivileges));
  }, [query.data, hasPrivileges]);
  
  const clearFilters = () => {
    filters.setProfessional(null);
    filters.setCanceled(false);
    filters.setType(null);
  }
  
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Calendario de Citas</h1>
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center mb-4q justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-lg font-semibold">Filtros</p>
              <LoaderCircle className={cn("w-5 h-5", query.isFetching ? "animate-spin" : "invisible")}/>
            </div>
            <div>
              <Button onClick={clearFilters}>
                <EraserIcon className="w-4 h-4"/>
                Limpiar
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-center justify-center mt-3">
            {hasPrivileges && <div className="w-60">
              <ComboboxQuery<User>
                queryKey={['users', 'professionals']}
                className="w-full"
                value={filters.professional}
                onSelect={filters.setProfessional}
                queryFn={fromPage(async (search) => await pageUsersAction({
                  search,
                  page: 0,
                  size: 15,
                  query: `authorities=in=(${Authority.MEDICAL_PROFESSIONAL},${Authority.LEGAL_PROFESSIONAL})`
                }))}
                toOption={(professional) => ({
                  value: professional.id.toString(),
                  label: `${professional.firstName} ${professional.lastName}`
                })}
              />
            </div>}
            <div className="w-60">
              <ComboboxQuery<User>
                queryKey={['users', 'attendants']}
                className="w-full"
                value={filters.attendant}
                onSelect={filters.setAttendant}
                queryFn={fromPage(async (search) => await pageUsersAction({
                  search,
                  page: 0,
                  size: 15,
                  query: `authorities=in=(${Authority.USER})`
                }))}
                toOption={(user) => ({
                  value: user.id.toString(),
                  label: `${user.firstName} ${user.lastName}`
                })}
              />
            </div>
            <SelectAppointmentType
              value={filters.type}
              onChange={filters.setType}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="canceled"
                checked={filters.canceled}
                onCheckedChange={checked => filters.setCanceled(checked as boolean)}
              />
              <label
                htmlFor="canceled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Cancelado
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-4 relative">
        <div>
          <FullCalendarController
            calendarRef={calendarRef}
          />
        </div>
        <Card className="h-[400px] overflow-y-scroll p-3 mt-4">
          <FullCalendarImproved
            ref={calendarRef}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            events={events}
            datesSet={(arg) => filters.setRange({
              from: new CalendarDate(arg.start.getFullYear(), arg.start.getMonth() + 1, arg.start.getDate()),
              to: new CalendarDate(arg.end.getFullYear(), arg.end.getMonth() + 1, arg.end.getDate())
            })}
          />
        </Card>
      </div>
    </>
  );
}

function toEventsInputs(appointments: Appointment[], hasPrivileged?: boolean): EventInput[] {
  
  return appointments.map(appointment => {
    const range = appointment.range;
    const canceled = appointment.canceled;
    const isPast = range.to.compare(now(ZONE_ID)) < 0;
    
    const title = hasPrivileged
      ? `${appointment.professional.firstName} ${appointment.professional.lastName}`
      : `${appointment.attendant.firstName} ${appointment.attendant.lastName}`
    
    return {
      id: appointment.id.toString(),
      title,
      start: range.from.toDate(ZONE_ID),
      end: range.to.toDate(ZONE_ID),
      editable: false,
      backgroundColor: `hsl(${getAppointmentColorVariable(canceled, isPast, false)})`,
      textColor: `hsl(${getAppointmentColorVariable(canceled, isPast, true)})`,
      extendedProps: {
        appointment,
        wrapper: ({children}: PropsWithChildren) => {
          console.log(children);
          return (
            <AppointmentModal appointment={appointment}>
              {children}
            </AppointmentModal>
          );
        },
        tooltipContent: {
          props: {
            className: "flex flex-col space-y-2 p-2 rounded-md shadow-md border border-gray-200"
          },
          child: (
            <div className="flex flex-col space-y-2">
              <p>Profesional: {appointment.professional.firstName} {appointment.professional.lastName}</p>
              <p>Usuario: {appointment.attendant.firstName} {appointment.attendant.lastName}</p>
              <p>{range.from.toString()} - {range.to.toString()}</p>
            </div>
          )
        }
      }
    }
  });
}

function getAppointmentColorVariable(isCanceled: boolean, isPast: boolean, isForeground: boolean) {
  const suffix = isForeground ? '-foreground' : '';
  
  if (isCanceled) return getCSSVariableValue(`--destructive${suffix}`);
  if (isPast) return getCSSVariableValue(`--muted${suffix}`);
  return getCSSVariableValue(`--primary${suffix}`);
}

function getCSSVariableValue(variableName: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}
