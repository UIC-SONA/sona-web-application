"use client";

import FullCalendarImproved from "@/components/calendar/full-calendar-improved";
import FullCalendarController from "@/components/calendar/full-calendar-controller"
import {useEffect, useRef, useState} from "react";
import {ComboboxQuery, fromPage} from "@/components/ui/combobox";
import {EventChangeArg, EventClickArg, EventInput} from "@fullcalendar/core";
import {Calendar, LoaderCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import FullCalendar from "@fullcalendar/react";
import {Card} from "@/components/ui/card";
import {CalendarDate, CalendarDateTime, today} from "@internationalized/date";
import {ZONE_ID} from "@/constants";
import {ProfessionalSchedule} from "@/app/(app)/dashboard/professionals-schedules/definitions";
import {Authority, User} from "@/app/(app)/dashboard/users/definitions";
import {AppointmentsRange} from "@/app/(app)/dashboard/appointments/definitions";
import {findProfessionalScheduleByProfessional} from "@/app/(app)/dashboard/professionals-schedules/actions";
import {findAppointmentsRangesByProfessionalAction} from "@/app/(app)/dashboard/appointments/actions";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {pageUsersAction} from "@/app/(app)/dashboard/users/actions";
import {ScheduleView} from "@/app/(app)/dashboard/professionals-schedules/_components/schedule-view";
import {CreateProfessionalScheduleForm} from "@/app/(app)/dashboard/professionals-schedules/_components/create-form";
import {UpdateProfessionalScheduleForm} from "@/app/(app)/dashboard/professionals-schedules/_components/update-form";
import {DeleteProfessionalScheduleForm} from "@/app/(app)/dashboard/professionals-schedules/_components/delete-form";

export default function Page() {
  
  const queryClient = useQueryClient();
  
  const [events, setEvents] = useState<EventInput[]>([]);
  const [range, setRange] = useState({from: today(ZONE_ID), to: today(ZONE_ID)});
  const [professional, setProfessional] = useState<User | null>(null);
  const [schedule, setSchedule] = useState<ProfessionalSchedule | null>(null);
  const [oldSchedule, setOldSchedule] = useState<ProfessionalSchedule | null>(null);
  
  const suffixQueryKey = [professional?.id, range.from, range.to];
  
  const schedulesQuery = useQuery<ProfessionalSchedule[]>({
    queryKey: ['professional-schedules', ...suffixQueryKey],
    queryFn: () => findProfessionalScheduleByProfessional(professional!.id, range.from, range.to),
    enabled: !!professional,
  })
  
  const appointmentsQuery = useQuery<AppointmentsRange[]>({
    queryKey: ['appointments-ranges', ...suffixQueryKey],
    queryFn: () => findAppointmentsRangesByProfessionalAction(professional!.id, range.from, range.to),
    enabled: !!professional,
  })
  
  const [showAppointments, setShowAppointments] = useState(false);
  const [scheduleViewOpen, setScheduleViewOpen] = useState(false);
  const [createScheduleOpen, setCreateScheduleOpen] = useState(false);
  const [updateScheduleOpen, setUpdateScheduleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  const calendarRef = useRef<FullCalendar | null>(null);
  
  useEffect(() => {
    const schedules = schedulesQuery.data || [];
    const appointments = showAppointments ? appointmentsQuery.data || [] : [];
    setEvents(toEventsInputs(schedules, appointments));
  }, [appointmentsQuery.data, schedulesQuery.data, showAppointments]);
  
  const findSchedule = (id: string) => {
    const schedules = schedulesQuery.data || [];
    return schedules.find((schedule) => schedule.id.toString() === id) as ProfessionalSchedule;
  }
  
  const addSchedules = (newSchedules: ProfessionalSchedule[]) => {
    queryClient.setQueryData<ProfessionalSchedule[]>(suffixQueryKey, (old) => {
      if (!old) return newSchedules;
      return [...old, ...newSchedules];
    });
  }
  
  const removeSchedule = (schedule: ProfessionalSchedule) => {
    queryClient.setQueryData<ProfessionalSchedule[]>(suffixQueryKey, (old) => {
      if (!old) return [];
      return old.filter((s) => s.id !== schedule.id);
    });
  }
  
  const updateSchedule = (schedule: ProfessionalSchedule) => {
    queryClient.setQueryData<ProfessionalSchedule[]>(suffixQueryKey, (old) => {
      if (!old) return [];
      return old.map((s) => s.id === schedule.id ? schedule : s);
    });
  }
  
  const handleEventClick = (info: EventClickArg) => {
    const schedule = info.event.extendedProps.schedule;
    if (schedule) {
      setSchedule(schedule as ProfessionalSchedule);
      setOldSchedule(null);
      setScheduleViewOpen(true);
    }
  }
  
  const handleEventChange = (info: EventChangeArg) => {
    const {start, end, extendedProps} = info.event;
    if (!start || !end || !extendedProps) return;
    
    const schedule = extendedProps.schedule;
    if (schedule) {
      const oldSchedule = schedule as ProfessionalSchedule;
      
      const newSchedule: ProfessionalSchedule = {
        ...findSchedule(info.event.id),
        date: new CalendarDate(start.getFullYear(), start.getMonth() + 1, start.getDate()),
        fromHour: start.getHours(),
        toHour: end.getHours(),
      };
      
      setSchedule(newSchedule);
      setOldSchedule(oldSchedule);
      updateSchedule(newSchedule);
      setUpdateScheduleOpen(true);
    }
  }
  
  return (
    <>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Horarios de atención</h1>
        
        <p className="text-muted-foreground text-sm">
          Seleccione un profesional para ver sus horarios de atención.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
            <ComboboxQuery<User>
              queryKey={['users']}
              className="w-full"
              value={professional}
              onSelect={setProfessional}
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
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Button
              className="w-full"
              onClick={() => setCreateScheduleOpen(true)} disabled={!professional}
            >
              <Calendar className="mr-2 h-4 w-4"/>
              Agregar horario
            </Button>
          </div>
        </div>
        
        <div className={cn(!professional && "hidden", "flex items-center gap-4")}>
          <Switch
            checked={showAppointments}
            onCheckedChange={setShowAppointments}
          />
          <Label>Mostrar citas</Label>
          <LoaderCircle className={cn(((schedulesQuery.isPending || appointmentsQuery.isPending) && !!professional) ? "animate-spin" : "invisible")}/>
        </div>
      </div>
      
      <div className="mt-4">
        <div>
          <FullCalendarController calendarRef={calendarRef}/>
        </div>
        
        <Card className="h-[500px] overflow-y-scroll p-3 mt-4">
          <FullCalendarImproved
            locale="es"
            ref={calendarRef}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            events={events}
            eventClick={handleEventClick}
            eventChange={handleEventChange}
            datesSet={(arg) => setRange({
              from: new CalendarDate(arg.start.getFullYear(), arg.start.getMonth() + 1, arg.start.getDate()),
              to: new CalendarDate(arg.end.getFullYear(), arg.end.getMonth() + 1, arg.end.getDate()),
            })}
          />
        </Card>
        
        <ScheduleView
          schedule={schedule}
          open={scheduleViewOpen}
          setOpen={setScheduleViewOpen}
          setDeleteOpen={setDeleteOpen}
          setUpdateScheduleOpen={setUpdateScheduleOpen}
        />
        
        <CreateProfessionalScheduleForm
          open={createScheduleOpen}
          onOpenChange={setCreateScheduleOpen}
          professional={professional}
          addSchedules={addSchedules}
        />
        
        <UpdateProfessionalScheduleForm
          open={updateScheduleOpen}
          onOpenChange={setUpdateScheduleOpen}
          schedule={schedule}
          setSchedule={setSchedule}
          oldSchedule={oldSchedule}
          updateSchedule={updateSchedule}
        />
        
        <DeleteProfessionalScheduleForm
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          schedule={schedule}
          removeSchedule={removeSchedule}
          setScheduleViewOpen={setScheduleViewOpen}
        />
      
      </div>
    </>
  );
}

function toEventsInputs(schedules: ProfessionalSchedule[], appoinments: AppointmentsRange[]): EventInput[] {
  const now = today(ZONE_ID);
  
  const scheduleColor = getCSSVariableValue("--primary");
  const scheduletextColor = getCSSVariableValue("--primary-foreground");
  
  const schenduleEvents = schedules.map<EventInput>((schedule) => {
    
    const from = new CalendarDateTime(schedule.date.year, schedule.date.month, schedule.date.day, schedule.fromHour);
    const to = new CalendarDateTime(schedule.date.year, schedule.date.month, schedule.date.day, schedule.toHour);
    const title = "Horario de atención";
    
    return {
      id: schedule.id.toString(),
      end: to.toDate(ZONE_ID),
      start: from.toDate(ZONE_ID),
      title: title,
      backgroundColor: `hsl(${scheduleColor})`,
      textColor: `hsl(${scheduletextColor})`,
      description: title,
      editable: now.compare(schedule.date) < 0,
      extendedProps: {schedule},
    };
  });
  
  const appoinmentsColor = getCSSVariableValue("--secondary");
  const appoinmentsTextColor = getCSSVariableValue("--secondary-foreground");
  
  const appoinmentsEvents = appoinments.map((appoinment) => {
    const title = 'Cita reservada';
    return {
      id: `${appoinment.from}-${appoinment.to}`,
      end: appoinment.to.toDate(ZONE_ID),
      start: appoinment.from.toDate(ZONE_ID),
      title: title,
      backgroundColor: `hsl(${appoinmentsColor})`,
      textColor: `hsl(${appoinmentsTextColor})`,
      description: title,
      editable: false,
      extendedProps: {appoinment},
    };
  });
  
  return [...schenduleEvents, ...appoinmentsEvents];
}

function getCSSVariableValue(variableName: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}
