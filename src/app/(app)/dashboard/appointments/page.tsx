"use client"

import {useMemo} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {appoimentsType, Appointment} from "@/app/(app)/dashboard/appointments/definitions";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import {getPeriod} from "@/lib/time";
import AppointmentModal from "@/app/(app)/dashboard/appointments/_components/appointment-modal";
import {EntityCrud} from "@/components/crud/shadcdn/entity-crud";
import {findAppointmentAction, pageAppointmentsAction} from "@/app/(app)/dashboard/appointments/actions";

export default function Page() {
  
  const columns = useMemo<ColumnDef<Appointment>[]>(() => [
    {
      header: "Id",
      accessorKey: "id",
    },
    {
      header: "Fecha",
      cell: ({row}) => row.original.date.toString()
    },
    {
      header: "Intervalo",
      cell: ({row}) => {
        const appointment = row.original;
        const startHourFormatted = appointment.hour + getPeriod(appointment.hour);
        const endHour = appointment.hour + 1;
        const endHourFormatted = endHour + getPeriod(endHour);
        return `${startHourFormatted} - ${endHourFormatted}`;
      }
    },
    {
      header: "Tipo",
      cell: ({row}) => {
        const type = row.original.type;
        return type ? appoimentsType[type] : "N/A";
      }
    },
    {
      header: "Usuario",
      cell: ({row}) => {
        const attendant = row.original.attendant;
        return `${attendant.firstName} ${attendant.lastName}`
      }
    },
    {
      header: "Profesional",
      enableSorting: false,
      cell: ({row}) => {
        const professional = row.original.professional;
        return `${professional.firstName} ${professional.lastName}`
      }
    },
    {
      header: "Cancelado",
      accessorKey: "canceled",
      cell: ({row}) => {
        return <div className="flex items-center justify-center">
          <Checkbox checked={row.original.canceled}/>
        </div>
      },
    },
    {
      header: "Acciones",
      enableSorting: false,
      cell: ({row}) => {
        return <div className="flex items-center gap-2">
          <AppointmentModal appointment={row.original}>
            <Button variant="outline" size="sm">
              Ver
            </Button>
          </AppointmentModal>
        </div>
      }
    }
  ], [])
  
  return <EntityCrud
    cacheKey="appointments"
    read={{
      title: "Citas",
      columns,
      pageAction: pageAppointmentsAction,
      findAction: findAppointmentAction,
    }}
  />
}