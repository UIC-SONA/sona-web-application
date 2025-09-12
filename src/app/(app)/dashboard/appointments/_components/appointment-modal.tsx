import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {UserIcon} from "lucide-react";
import {appoimentsType, Appointment} from "@/app/(app)/dashboard/appointments/definitions";
import {getPeriod} from "@/lib/time";
import {PropsWithChildren} from "react";

interface AppointmentViewProps extends PropsWithChildren {
  appointment: Appointment;
}

export default function AppointmentModal({appointment, children}: Readonly<AppointmentViewProps>) {
  
  const period = getPeriod(appointment.hour);
  const formattedDate = appointment.date.toString();
  const formattedHour = `${appointment.hour} ${period}`;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-lg shadow-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex justify-start items-center text-lg font-semibold">
            <span>Detalles de la Cita</span>
            {appointment?.canceled && (
              <Badge variant="destructive" className="text-xs ml-2">
                Cancelada
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Fecha y Hora</h4>
            <p className="text-sm">
              {appointment ? `${formattedDate} - ${formattedHour}` : '...'}
            </p>
          </div>
          
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Tipo de Cita</h4>
            <p className="text-sm">
              {appointment ? appoimentsType[appointment.type] : '...'}
            </p>
          </div>
          
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Profesional</h4>
            <div className="flex items-center gap-2 text-sm">
              <UserIcon size={16}/>
              <span>
        {appointment
          ? `${appointment.professional.firstName} ${appointment.professional.lastName}`
          : '...'
        }
      </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Paciente</h4>
            <div className="flex items-center gap-2 text-sm">
              <UserIcon size={16}/>
              <span>
        {appointment
          ? `${appointment.attendant.firstName} ${appointment.attendant.lastName}`
          : '...'
        }
      </span>
            </div>
          </div>
          
          {appointment?.canceled && (
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Motivo de Cancelación</h4>
              <p className="text-sm">{appointment.cancellationReason || '...'}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}