import {ProfessionalSchedule} from "@/app/(app)/dashboard/professionals-schedules/definitions";
import {Dispatch, SetStateAction} from "react";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {getPeriod} from "@/lib/time";
import {Button} from "@/components/ui/button";
import {EditIcon, TrashIcon} from "lucide-react";

export interface ScheduleViewProps {
  schedule: ProfessionalSchedule | null;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setDeleteOpen: Dispatch<SetStateAction<boolean>>;
  setUpdateScheduleOpen: Dispatch<SetStateAction<boolean>>;
}

export function ScheduleView({schedule, open, setOpen, setDeleteOpen, setUpdateScheduleOpen}: Readonly<ScheduleViewProps>) {
  
  const professional = schedule?.professional;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
      >
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Horario de atención de {professional?.firstName} {professional?.lastName}
          </DialogTitle>
          <DialogDescription>
            {schedule?.date.toString()}
            <br/>
            {schedule && (schedule.fromHour + " " + getPeriod(schedule.fromHour) + "- " + (schedule.toHour + " " + getPeriod(schedule.toHour)))}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setDeleteOpen(true)}>
            <TrashIcon/>
            Eliminar
          </Button>
          <Button onClick={() => setUpdateScheduleOpen(true)}>
            <EditIcon/>
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}